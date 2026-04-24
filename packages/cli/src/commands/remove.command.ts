import type { ICommand } from './types';

/**
 * `spark-edge remove`
 *
 * Completely disconnects and unpairs this Edge:
 *  1. Stop MQTT connection (with 'death rattle' status update)
 *  2. Delete identity and MQTT credentials
 *  3. Clear local edge config
 */
export class RemoveCommand implements ICommand {
  async run(): Promise<void> {
    const { clearEdgeIdentity, getSystemIdentity } = await import('spark-edge-core');
    const { clearMqttCredentials, mqttClient, mqttService, unpairWithCloud } = await import('spark-edge-core');
    const { dbManager } = await import('spark-edge-db');

    const identity = await getSystemIdentity();
    if (!identity.provisioned || !identity.edge_id) {
      console.log('\n  Edge is not connected to Spark Cloud — nothing to remove.\n');
      return;
    }

    console.log('\n⚡ SparkEdge — Removing Cloud Connection & Identity\n');
    console.warn('  WARNING: This will completely unpair this device from Spark Cloud.');
    
    // Step 0: Signal Cloud (Synchronous)
    try {
      process.stdout.write('  Signaling cloud removal...');
      await unpairWithCloud(identity.edge_id);
      console.log(' ✓');
    } catch (err: any) {
      console.log(` ⚠ Could not signal cloud: ${err.message}`);
      // Proceeding with local wipe anyway
    }

    // Step 1: Graceful MQTT shutdown with 'death rattle' (offline status)
    if (mqttClient.isConnected()) {
      try {
        process.stdout.write('  Sending final status to Spark...');
        await mqttService.publishOfflineStatus();
        console.log(' ✓');
      } catch {
        // Best-effort
      }
      process.stdout.write('  Disconnecting MQTT...');
      await mqttClient.disconnect();
      console.log(' ✓');
    }

    // Step 2: Wipe all data
    process.stdout.write('  Wiping local identity and credentials...');
    await clearMqttCredentials();
    await clearEdgeIdentity();
    // Also clear the general config (name, lat, lng) to reset to onboarding
    dbManager.edge.clearEdgeConfig();
    console.log(' ✓');

    console.log('\n✓ Edge connection removed and identity wiped.');
    console.log('  The device is now in a clean state and ready for a new onboarding.\n');
  }
}
