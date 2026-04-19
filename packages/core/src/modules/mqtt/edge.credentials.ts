import { dbManager } from 'spark-edge-db';

/**
 * Manages MQTT credentials for the Edge.
 * Persisted in monitor.db via @spark-edge/db.
 */

export interface MqttCredentials {
  brokerUrl: string;
  username?: string;
  password?: string;
}

/** Save MQTT credentials received from Spark Cloud provisioning */
export function saveMqttCredentials(creds: MqttCredentials): void {
  dbManager.edge.upsertMqttCredentials({
    broker_url: creds.brokerUrl,
    username: creds.username || null,
    password: creds.password || null,
  });
}

/** Retrieve credentials for MQTT connection */
export function getMqttCredentials(): MqttCredentials | null {
  const data = dbManager.edge.getMqttCredentials().data;
  
  if (!data || !data.broker_url) {
    return null;
  }

  return {
    brokerUrl: data.broker_url,
    username: data.username || undefined,
    password: data.password || undefined,
  };
}

/** Clear credentials (on disconnect/reset) */
export function clearMqttCredentials(): void {
  dbManager.edge.clearMqttCredentials();
}
