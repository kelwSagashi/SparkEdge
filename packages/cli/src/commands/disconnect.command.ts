import type { ICommand } from './types';

/**
 * `spark-edge disconnect`
 *
 * Disconnects this Edge from the Spark cloud:
 *  1. Stop MQTT connection
 *  2. Clear edge_id from local DB
 *  3. Clear MQTT credentials from local DB
 *
 * After disconnect, `spark-edge connect` can be used to re-register.
 */
export class DisconnectCommand implements ICommand {
  async run(): Promise<void> {
    const { isProvisioned, clearEdgeIdentity } = await import('spark-edge-core');
    const { clearMqttCredentials, mqttClient, mqttService } = await import('spark-edge-core');

    if (!isProvisioned()) {
      console.log('\n  Edge is not connected to Spark — nothing to do.\n');
      return;
    }

    console.log('\n⚡ SparkEdge — Disconnecting from Spark Cloud\n');

    // Step 1: Graceful MQTT shutdown
    if (mqttClient.isConnected()) {
      try {
        process.stdout.write('  Publishing offline status...');
        await mqttService.publishOfflineStatus();
        console.log(' ✓');
      } catch {
        // Best-effort
      }
      process.stdout.write('  Disconnecting MQTT...');
      await mqttClient.disconnect();
      console.log(' ✓');
    }

    // Step 2: Clear local data
    clearMqttCredentials();
    clearEdgeIdentity();

    console.log('\n✓ Edge disconnected and credentials removed.');
    console.log('  Run `spark-edge connect` to re-register.\n');
  }
}
