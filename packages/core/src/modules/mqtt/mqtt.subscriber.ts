import { getClient } from './mqtt.client';
import { getCommandTopic } from './mqtt.topics';
import { getEdgeId } from './edge.identity';
import { handleCommand } from './mqtt.handlers';

/**
 * Subscribe to the command topic and forward incoming messages to the handler.
 */
export async function subscribe(): Promise<void> {
  const edgeId = await getEdgeId();
  if (!edgeId) {
    console.log('[Mqtt] Edge not provisioned. Skipping subscription.');
    return;
  }
  
  const commandTopic = getCommandTopic(edgeId);
  const client = getClient();

  await new Promise<void>((resolve, reject) => {
    client.subscribe(commandTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error('[Mqtt] Subscription failed:', err.message);
        reject(err);
      } else {
        console.log(`[Mqtt] Subscribed to ${commandTopic}`);
        resolve();
      }
    });
  });

  client.on('message', (topic, message) => {
    if (topic !== commandTopic) return;
    const raw = message.toString();
    console.log(`[Mqtt] Message received on ${topic}`);
    handleCommand(raw).catch((err) => {
      console.error('[Mqtt] Error handling command:', err.message);
    });
  });
}

/**
 * Re-subscribe after a reconnection event.
 */
export async function resubscribe(): Promise<void> {
  console.log('[Mqtt] Re-subscribing to topics...');
  await subscribe();
}
