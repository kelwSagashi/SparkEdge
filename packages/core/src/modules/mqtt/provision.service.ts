import fs from 'node:fs';
import path from 'node:path';
import { dbManager } from 'spark-edge-db';

const EDGE_JSON_PATH = path.resolve(process.cwd(), 'data', 'edge.json');

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
  /** Load identity from edge.json (primary) or DB (fallback) */
  async load(): Promise<EdgeJson | null> {
    try {
      if (fs.existsSync(EDGE_JSON_PATH)) {
        const data = JSON.parse(fs.readFileSync(EDGE_JSON_PATH, 'utf-8'));
        return data as EdgeJson;
      }
    } catch (err) {
      console.error('[ProvisionService] Failed to load edge.json:', err);
    }

    // Fallback to DB
    const { data: identity } = dbManager.edge.getIdentity();
    const { data: mqtt } = dbManager.edge.getMqttCredentials();

    if (identity?.provisioned && mqtt) {
      return {
        edge_id: identity.edge_id,
        edge_name: identity.edge_name || '',
        mqtt: {
          url: mqtt.broker_url || '',
          username: mqtt.username || '',
          password: mqtt.password || '',
        },
        provisioned: true,
      };
    }

    return null;
  },

  /** Save identity and credentials to both edge.json and DB */
  async save(data: EdgeJson): Promise<void> {
    // 1. Save to DB
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

    // 2. Save to edge.json (Atomic-like)
    try {
      const dir = path.dirname(EDGE_JSON_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tmpPath = `${EDGE_JSON_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), { mode: 0o600 });
      fs.renameSync(tmpPath, EDGE_JSON_PATH);
      
      console.log('[ProvisionService] Edge data saved to edge.json');
    } catch (err) {
      console.error('[ProvisionService] Failed to save edge.json:', err);
    }
  },

  /** Check if the system is provisioned */
  async isProvisioned(): Promise<boolean> {
    const data = await this.load();
    return !!data?.provisioned;
  },

  /** Clear identity (destructive - usually not called anymore by disconnect) */
  async clear(): Promise<void> {
    if (fs.existsSync(EDGE_JSON_PATH)) {
      fs.unlinkSync(EDGE_JSON_PATH);
    }
    dbManager.edge.clearIdentity();
    dbManager.edge.clearMqttCredentials();
  }
};
