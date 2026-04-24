import { provisionService } from './provision.service';
import { getSystemIdentity } from './edge.identity';
import * as topics from './mqtt.topics';
import { publish, publishRetained } from './mqtt.publisher';
import { retryAll } from './mqtt.queue';
import { dbManager } from 'spark-edge-db';
import { collectSystemStats } from '../system/stats.collector';


export interface StatusPayload {
  edge_id: string;
  online: boolean;
  timestamp: string;
  system: {
    version: string;
    uptime: number;
  };
  location: {
    lat: string | null;
    lng: string | null;
    source: string;
  };
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let queueRetryTimer: ReturnType<typeof setInterval> | null = null;
let statsTimer: ReturnType<typeof setInterval> | null = null;



async function buildStatusPayload(
  online: boolean
): Promise<StatusPayload> {
  const identity = await getSystemIdentity();
  if (!identity.edge_id) {
    throw new Error('Edge ID not available');
  }

  const { data: config } = dbManager.edge.getEdgeConfig();

  return {
    edge_id: identity.edge_id,
    online,
    timestamp: new Date().toISOString(),
    system: {
      version: process.env.npm_package_version ?? '1.0.0',
      uptime: process.uptime(),
    },
    location: {
      lat: config?.lat || null,
      lng: config?.lng || null,
      source: config?.location_source || 'manual',
    },
  };
}

/**
 * Publish the edge online status with retention.
 */
export async function publishStatus(): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getStatusTopic(edgeData.edge_id);
  const payload = await buildStatusPayload(true);
  
  await publishRetained(topic, payload);
  
  // Also publish full metadata on status update
  await publishMetadata().catch(err => {
    console.error('[Mqtt] Failed to publish initial metadata:', err);
  });
}

/**
 * Publish the full edge metadata (name, location, hardware, etc.)
 */
export async function publishMetadata(): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const { data: config } = dbManager.edge.getEdgeConfig();
  const { collectSystemMetadata } = await import('../system/metadata');
  const systemMetadata = await collectSystemMetadata();

  const topic = topics.getMetaTopic(edgeData.edge_id);
  
  await publish(topic, {
    edge_name: config?.edge_name || edgeData.edge_name,
    description: config?.description || null,
    lat: config?.lat || null,
    lng: config?.lng || null,
    tags: config?.tags || [],
    os: systemMetadata.os,
    os_version: systemMetadata.os_version,
    edge_version: systemMetadata.edge_version,
    hardware: systemMetadata.hardware,
    environment: config?.environment || 'production',
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish offline status (called on graceful shutdown).
 */
export async function publishOfflineStatus(): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getStatusTopic(edgeData.edge_id);
  const payload = await buildStatusPayload(false);
  await publishRetained(topic, payload);
}

/**
 * Publish a heartbeat message.
 */
export async function publishHeartbeat(): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getHeartbeatTopic(edgeData.edge_id);
  await publish(topic, { 
    edge_id: edgeData.edge_id,
    ts: Math.floor(Date.now() / 1000) 
  });
}

/**
 * Publish real-time system statistics.
 */
export async function publishStats(): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getStatsTopic(edgeData.edge_id);
  const stats = collectSystemStats();
  
  await publish(topic, stats);
}


/**
 * Publish the result of a command execution.
 */
export async function publishResponse(
  commandId: string,
  status: 'done' | 'error' | 'running',
  result?: Record<string, any> | null,
  error?: string
): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getResponseTopic(edgeData.edge_id);
  await publish(topic, {
    command_id: commandId,
    status,
    result: result ?? null,
    error: error ?? null,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Publish a log message.
 */
export async function publishLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getLogTopic(edgeData.edge_id);
  await publish(topic, { level, message, timestamp: new Date().toISOString() });
}

/**
 * Publish the active local user context.
 */
export async function publishContext(user: { id: string, email: string, first_name?: string | null, last_name?: string | null }): Promise<void> {
  const edgeData = await provisionService.load();
  if (!edgeData?.provisioned) return;

  const topic = topics.getContextTopic(edgeData.edge_id);
  await publish(topic, {
    edge_id: edgeData.edge_id,
    local_user: {
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
      email: user.email
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Start the heartbeat interval (every 30s).
 */
export function startHeartbeat(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(async () => {
    try {
      await publishHeartbeat();
    } catch {
      // Heartbeat failures are non-fatal
    }
  }, 30_000);
  console.log('[Mqtt] Heartbeat started (30s interval)');
}

/**
 * Start the queue retry interval (every 60s).
 */
export function startQueueRetry(): void {
  if (queueRetryTimer) return;
  queueRetryTimer = setInterval(async () => {
    try {
      await retryAll();
    } catch {
      // Retry failures are non-fatal
    }
  }, 60_000);
  console.log('[Mqtt] Queue retry started (60s interval)');
}

/**
 * Start the system stats publication interval (every 60s).
 */
export function startStatsInterval(): void {
  if (statsTimer) return;
  
  // Initial collection
  publishStats().catch(() => {});

  statsTimer = setInterval(async () => {
    try {
      await publishStats();
    } catch (err) {
      console.error('[Mqtt] Failed to publish system stats:', err);
    }
  }, 60_000);
  console.log('[Mqtt] System stats publishing started (60s interval)');
}


/**
 * Stop all background timers.
 */
export function stopTimers(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (queueRetryTimer) {
    clearInterval(queueRetryTimer);
    queueRetryTimer = null;
  }
  if (statsTimer) {
    clearInterval(statsTimer);
    statsTimer = null;
  }
}

