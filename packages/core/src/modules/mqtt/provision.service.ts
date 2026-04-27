import { dbManager } from 'spark-edge-db';

export interface EdgeJson {
  edge_id: string;
  edge_name: string;
  mqtt: {
    url: string;
    username: string;
    password: string;
  };
  provisioned: boolean;
}

export const provisionService = {
  /**
   * Load identity from DB.
   * Uses ONLY credentials persisted during pairing — never global env vars.
   */
  async load(): Promise<EdgeJson | null> {
    const { data: identity } = dbManager.edge.getIdentity();
    const { data: mqtt } = dbManager.edge.getMqttCredentials();

    if (!identity?.provisioned || !identity.edge_id) {
      return null;
    }

    if (!mqtt?.broker_url || !mqtt.username || !mqtt.password) {
      console.warn('[Provision] Identity found but MQTT credentials are missing. Re-pair the device.');
      return null;
    }

    return {
      edge_id: identity.edge_id,
      edge_name: identity.edge_name || '',
      mqtt: {
        url: mqtt.broker_url,
        username: mqtt.username,
        password: mqtt.password,
      },
      provisioned: true,
    };
  },

  /** Save identity and credentials to DB */
  async save(data: EdgeJson): Promise<void> {
    dbManager.edge.upsertIdentity({
      edge_id: data.edge_id,
      edge_name: data.edge_name,
      provisioned: data.provisioned ? 1 : 0,
    });

    dbManager.edge.upsertMqttCredentials({
      broker_url: data.mqtt.url,
      username: data.mqtt.username,
      password: data.mqtt.password,
    });
  },

  /** Check if the system is provisioned */
  async isProvisioned(): Promise<boolean> {
    const data = await this.load();
    return !!data?.provisioned;
  },

  /** Clear identity (on reset/unpair) */
  async clear(): Promise<void> {
    dbManager.edge.clearIdentity();
    dbManager.edge.clearMqttCredentials();
  }
};
