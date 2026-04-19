import { mqttClient, mqttService, mqttQueue, mqttSubscriber } from 'spark-edge-core';
import { getLocation } from './mqtt.status';

const { getClient, isConnected, disconnect } = mqttClient;
const { publishStatus, publishOfflineStatus, startHeartbeat, startQueueRetry, stopTimers } = mqttService;
const { retryAll } = mqttQueue;
const { resubscribe } = mqttSubscriber;

/**
 * Lifecycle hooks for the MQTT module.
 * Called by the CLI bootstrap to wire MQTT into the application lifecycle.
 */

export async function onStart(): Promise<void> {
  const location = getLocation();
  await publishStatus(location);
  startHeartbeat();
  startQueueRetry();
  console.log('[Mqtt] Lifecycle: started');
}

export async function onShutdown(): Promise<void> {
  console.log('[Mqtt] Lifecycle: shutting down...');
  stopTimers();
  try {
    await publishOfflineStatus();
  } catch {
    // Best-effort — don't block shutdown
  }
  await disconnect();
  console.log('[Mqtt] Lifecycle: disconnected');
}

export function onReconnect(): void {
  console.log('[Mqtt] Lifecycle: reconnected — re-subscribing and re-syncing...');
  resubscribe().catch((err) => console.error('[Mqtt] Re-subscribe failed:', err.message));
  const location = getLocation();
  publishStatus(location).catch(() => {});
  retryAll().catch(() => {});
}

export function onDisconnect(): void {
  console.log('[Mqtt] Lifecycle: disconnected from broker');
}

/**
 * Wire lifecycle hooks to the MQTT client events.
 */
export function attachLifecycleHooks(): void {
  if (!isConnected()) return;
  const client = getClient();

  client.on('reconnect', onReconnect);
  client.on('close', onDisconnect);

  // Register OS shutdown signals
  process.on('SIGINT', async () => {
    await onShutdown();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await onShutdown();
    process.exit(0);
  });
}
