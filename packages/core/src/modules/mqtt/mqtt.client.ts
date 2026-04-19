import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { loadMqttConfig } from './mqtt.config';
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
 * Throws if provisioned but the connection attempt times out.
 */
export async function connect(): Promise<MqttClient | null> {
  const result = loadMqttConfig();

  if (!result.enabled || !result.config) {
    // Not provisioned — not an error, just disabled
    return null;
  }

  const config = result.config;
  const statusTopic = getStatusTopic(config.edgeId);

  const options: IClientOptions = {
    clientId: config.clientId,
    username: config.username,
    password: config.password,
    reconnectPeriod: config.reconnectPeriod,
    keepalive: config.keepalive,
    clean: true,
    // Last Will: broadcast offline if connection drops unexpectedly
    will: {
      topic: statusTopic,
      payload: Buffer.from(JSON.stringify({ online: false, edge_id: config.edgeId })),
      qos: 1,
      retain: true,
    },
  };

  return new Promise((resolve, reject) => {
    console.log(`[Mqtt] Connecting to ${config.url} as ${config.clientId}...`);
    client = mqtt.connect(config.url, options);

    client.on('connect', () => {
      connected = true;
      console.log('[Mqtt] Connected');
      resolve(client!);
    });

    client.on('reconnect', () => {
      console.log('[Mqtt] Reconnecting...');
    });

    client.on('close', () => {
      connected = false;
      console.log('[Mqtt] Disconnected');
    });

    client.on('error', (err: any) => {
      // MQTT connack error codes 4/5 = bad username or not authorized
      const isBadCredentials =
        err.message?.includes('Not authorized') ||
        err.message?.includes('Bad username or password') ||
        err.code === 4 ||
        err.code === 5;

      if (isBadCredentials) {
        console.error('[Mqtt] Authentication rejected by broker — disabling MQTT.');
        console.error('  Run `spark-edge disconnect` then `spark-edge connect` to re-provision.');
        client?.end(true);
        client = null;
        connected = false;
        if (!connected) reject(new Error('[Mqtt] Bad credentials'));
        return;
      }

      console.error('[Mqtt] Connection error:', err.message);
      if (!connected) {
        reject(err);
      }
    });

    setTimeout(() => {
      if (!connected) {
        reject(new Error('[Mqtt] Connection timeout'));
      }
    }, 15_000);
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
