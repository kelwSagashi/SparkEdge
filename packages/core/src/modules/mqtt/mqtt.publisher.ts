import { IClientPublishOptions } from 'mqtt';
import { getClient, isConnected } from './mqtt.client';
import { enqueue } from './mqtt.queue';

/**
 * Publish a message to an MQTT topic.
 * Falls back to the local queue if the broker is unavailable.
 */
export async function publish(
  topic: string,
  payload: Record<string, any> | string,
  options?: Partial<IClientPublishOptions>
): Promise<void> {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const publishOptions: IClientPublishOptions = {
    qos: 1,
    retain: false,
    ...options,
  };

  if (!isConnected()) {
    console.warn(`[Mqtt] Offline — queuing message for topic: ${topic}`);
    await enqueue(topic, serialized);
    return;
  }

  return new Promise((resolve, reject) => {
    getClient().publish(topic, serialized, publishOptions, (err) => {
      if (err) {
        console.error(`[Mqtt] Publish failed for topic ${topic}:`, err.message);
        // Fallback to queue so it can be retried later
        enqueue(topic, serialized).catch(() => {});
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Publish a retained status message.
 */
export async function publishRetained(
  topic: string,
  payload: Record<string, any>
): Promise<void> {
  return publish(topic, payload, { retain: true, qos: 1 });
}
