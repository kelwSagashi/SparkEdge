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
export async function saveMqttCredentials(creds: MqttCredentials): Promise<void> {
  const result = dbManager.edge.upsertMqttCredentials({
    broker_url: creds.brokerUrl,
    username: creds.username || null,
    password: creds.password || null,
  });
  if (result.error) {
    console.error("[EdgeCredentials] Failed to save credentials:", result.error);
  }
}

/** Retrieve credentials for MQTT connection */
export async function getMqttCredentials(): Promise<MqttCredentials | null> {
  const result = dbManager.edge.getMqttCredentials();
  const data = result.data;
  
  if (result.error) {
    console.error("[EdgeCredentials] Failed to get credentials:", result.error);
  }

  // Return null if no credentials exist in DB
  if (!data || !data.broker_url) {
    return null;
  }

  return {
    brokerUrl: data.broker_url,
    username: data.username || undefined,
    password: data.password || undefined,
  };
}

/** 
 * Ensure default credentials exist if none are set.
 */
export async function ensureDefaultMqttCredentials(): Promise<void> {
  // No longer auto-creates credentials as per refactor request.
  // Must be provisioned via Spark Cloud.
}

/** Clear credentials (on disconnect/reset) */
export async function clearMqttCredentials(): Promise<void> {
  dbManager.edge.clearMqttCredentials();
}
