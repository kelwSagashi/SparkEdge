import type { ICommand } from './types';

/**
 * `spark-edge status`
 *
 * Displays the current Spark Edge status:
 *  1. Provisioning status (Edge ID, Edge Name)
 *  2. MQTT connectivity
 *  3. Local configuration (tags, location)
 *  4. System info
 */
export class StatusCommand implements ICommand {
  async run(): Promise<void> {
    const { isProvisioned, getSystemIdentity } = await import('spark-edge-core');
    const { mqttClient } = await import('spark-edge-core');
    const { dbManager } = await import('spark-edge-db');
    const { getSystemInfo } = await import('../integrations/mqtt/mqtt.status');

    console.log('\n⚡ SparkEdge — System Status\n');

    const provisioned = await isProvisioned();
    const identity = await getSystemIdentity();
    const mqttConnected = mqttClient.isConnected();
    const systemInfo = await getSystemInfo();
    const { data: config } = dbManager.edge.getEdgeConfig();

    console.log(`  Provisioned : ${provisioned ? '✓ Connected to Spark Cloud' : '✗ Not Connected'}`);
    
    if (provisioned) {
      console.log(`  Edge ID     : ${identity.edge_id}`);
      console.log(`  Edge Name   : ${identity.edge_name}`);
    }

    console.log(`  MQTT Status : ${mqttConnected ? '● Online' : '○ Offline'}`);
    
    if (config) {
      console.log(`\n  --- Local Config ---`);
      console.log(`  Name        : ${config.edge_name}`);
      console.log(`  Location    : ${config.lat}, ${config.lng} (${config.location_source})`);
      console.log(`  Tags        : ${config.tags?.join(', ') || 'none'}`);
    }

    console.log(`\n  --- System ---`);
    console.log(`  Version     : ${systemInfo.version}`);
    console.log(`  Hostname    : ${systemInfo.hostname}`);
    console.log(`  Uptime      : ${Math.floor(systemInfo.uptime / 60)} minutes\n`);
  }
}
