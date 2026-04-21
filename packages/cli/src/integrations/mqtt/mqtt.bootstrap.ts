import { mqttClient, mqttSubscriber, ensureDefaultMqttCredentials } from 'spark-edge-core';
export { ensureDefaultMqttCredentials };
import { attachLifecycleHooks, onStart } from './mqtt.lifecycle';
import { registerMqttCommandHandlers } from './mqtt.commands';

const { connect } = mqttClient;
const { subscribe } = mqttSubscriber;

/**
 * Initializes the MQTT module.
 * Returns false if MQTT is not provisioned (disabled state).
 *
 * Order:
 *  1. Register command dispatcher (before subscribing so nothing is missed)
 *  2. Connect to broker — may return null if not provisioned
 *  3. Subscribe to command topic
 *  4. Publish initial status + start heartbeat + start queue retry
 *  5. Attach lifecycle hooks
 */
export async function init(): Promise<boolean> {
  console.log('[Mqtt] Initializing...');

  // 1. Wire command handlers before we start receiving messages
  registerMqttCommandHandlers();

  // 2. Connect — returns null if credentials are missing
  const client = await connect();

  if (!client) {
    console.log('[Mqtt] Not provisioned — skipping subscription and status publish.');
    return false;
  }

  // 3. Subscribe to command topic
  await subscribe();

  // 4. Publish initial status and start background timers
  await onStart();

  // 5. Attach lifecycle hooks
  attachLifecycleHooks();

  console.log('[Mqtt] Initialized successfully');
  return true;
}

/**
 * Initialize MQTT without throwing if the broker is unavailable.
 * Also handles unprovisionied state (returns false).
 */
export async function initSafe(): Promise<boolean> {
  try {
    return await init();
  } catch (err: any) {
    console.warn(`[Mqtt] Could not connect to broker: ${err.message}`);
    console.warn('[Mqtt] Running in offline mode — messages will be queued when provisioned.');
    return false;
  }
}
