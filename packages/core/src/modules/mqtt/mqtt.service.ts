import { provisionService } from './provision.service';
import { getSystemIdentity } from './edge.identity';
import * as topics from './mqtt.topics';
import { publish, publishRetained } from './mqtt.publisher';
import { retryAll } from './mqtt.queue';
import { dbManager } from 'spark-edge-db';

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
}
