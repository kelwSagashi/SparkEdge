import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { getStatusTopic } from './mqtt.topics';

let client: MqttClient | null = null;
let connected = false;

export function getClient(): MqttClient {
  if (!client) {
    throw new Error('[Mqtt] Client not initialized. Call connect() first.');
  }
  return client;
}

export function isConnected(): boolean {
  return connected;
}

/**
 * Attempt to connect to the MQTT broker.
 * Returns null if MQTT is not provisioned (disabled state).
 */
export async function connect(): Promise<MqttClient | null> {
  const { provisionService } = await import('./provision.service');
  const edgeData = await provisionService.load();

  if (!edgeData || !edgeData.provisioned) {
    console.log('[Mqtt] Not provisioned. Connection skipped.');
    return null;
  }

  const { url, username, password } = edgeData.mqtt;
  const edgeId = edgeData.edge_id;
  const statusTopic = getStatusTopic(edgeId);

  const options: IClientOptions = {
    clientId: `${edgeId}`,  // Use edgeId directly as clientId for EMQX username matching
    username,
    password,
    reconnectPeriod: 5000,
    keepalive: 30,
    clean: true,
    // Last Will: EMQX will broadcast this if connection drops unexpectedly
    will: {
      topic: statusTopic,
      payload: Buffer.from('offline'),  // Plain string — matches SparkAPI handler
      qos: 1,
      retain: true,
    },
  };

  return new Promise((resolve, reject) => {
    console.log(`[Mqtt] Connecting to ${url}...`);
    client = mqtt.connect(url, options);

    client.on('connect', () => {
      connected = true;
      console.log('[Mqtt] Connected');
      
      // Publish online status as plain string (matches EMQX/SparkAPI standard)
      client?.publish(statusTopic, 'online', { qos: 1, retain: true });
      
      // Force timer resets and immediate resync on reconnection
      import('./mqtt.service').then(s => {
        s.stopTimers();
        s.startHeartbeat();
        s.startQueueRetry();
        s.startStatsInterval();
        s.publishHeartbeat().catch(() => {});
      });

      import('./mqtt.queue').then(q => {
        q.retryAll().catch(() => {});
      });

      resolve(client!);
    });

    client.on('reconnect', () => {
      console.log('[Mqtt] Reconectando ao MQTT...');
    });

    client.on('close', () => {
      connected = false;
      console.log('[Mqtt] MQTT desconectado');
    });

    client.on('error', (err: any) => {
      console.error('[Mqtt] Erro de conexão:', err.message);
      if (!connected) {
        reject(err);
      }
    });

    // Don't reject for initial connection failure if it's already connected once?
    // Actually, for boot-up, we want it to keep trying.
    setTimeout(() => {
      if (!connected) {
        console.warn('[Mqtt] Connection taking longer than expected, will continue retrying in background.');
        resolve(client!); // Resolve anyway to allow background retries
      }
    }, 10_000);
  });
}

export async function disconnect(): Promise<void> {
  return new Promise((resolve) => {
    if (!client) {
      resolve();
      return;
    }
    client.end(false, {}, () => {
      connected = false;
      client = null;
      resolve();
    });
  });
}

/**
 * Reconnect with the current (or updated) credentials.
 * Call this after saving new credentials via provisionCommand.
 */
export async function reconnectWithNewCredentials(): Promise<MqttClient | null> {
  await disconnect();
  return connect();
}
