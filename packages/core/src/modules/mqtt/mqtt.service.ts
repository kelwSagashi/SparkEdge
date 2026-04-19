import { loadMqttConfig } from './mqtt.config';
import { getOrCreateEdgeId } from './edge.identity';
import * as topics from './mqtt.topics';
import { publish, publishRetained } from './mqtt.publisher';
import { retryAll } from './mqtt.queue';

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

/**
 * Returns the edge_id safely regardless of provisioning state.
 * Uses the persistent local identity (never env vars).
 */
function getEdgeId(): string {
  return getOrCreateEdgeId();
}

function buildStatusPayload(
  online: boolean,
  location?: { lat: string | null; lng: string | null; source: string }
): StatusPayload {
  return {
    edge_id: getEdgeId(),
    online,
    timestamp: new Date().toISOString(),
    system: {
      version: process.env.npm_package_version ?? '0.0.0',
      uptime: process.uptime(),
    },
    location: location ?? { lat: null, lng: null, source: 'none' },
  };
}

/**
 * Publish the edge online status with retention.
 * No-op if MQTT is not provisioned.
 */
export async function publishStatus(
  location?: { lat: string | null; lng: string | null; source: string }
): Promise<void> {
  const result = loadMqttConfig();
  if (!result.enabled || !result.config) return;
  const topic = topics.getStatusTopic(result.config.edgeId);
  const payload = buildStatusPayload(true, location);
  await publishRetained(topic, payload);
}

/**
 * Publish offline status (called on graceful shutdown).
 * No-op if MQTT is not provisioned.
 */
export async function publishOfflineStatus(): Promise<void> {
  const result = loadMqttConfig();
  if (!result.enabled || !result.config) return;
  const topic = topics.getStatusTopic(result.config.edgeId);
  const payload = buildStatusPayload(false);
  await publishRetained(topic, payload);
}

/**
 * Publish a heartbeat message.
 * No-op if MQTT is not provisioned.
 */
export async function publishHeartbeat(): Promise<void> {
  const result = loadMqttConfig();
  if (!result.enabled || !result.config) return;
  const topic = topics.getHeartbeatTopic(result.config.edgeId);
  await publish(topic, { timestamp: new Date().toISOString() });
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
  const mqttResult = loadMqttConfig();
  if (!mqttResult.enabled || !mqttResult.config) return;
  const topic = topics.getResponseTopic(mqttResult.config.edgeId);
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
  const mqttResult = loadMqttConfig();
  if (!mqttResult.enabled || !mqttResult.config) return;
  const topic = topics.getLogTopic(mqttResult.config.edgeId);
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
