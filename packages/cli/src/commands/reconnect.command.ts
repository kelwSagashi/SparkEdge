import type { ICommand } from './types';

/**
 * `spark-edge reconnect`
 *
 * Manually forces a reconnection to the MQTT broker.
 * Uses the credentials already saved in the local DB.
 * No cloud interaction — purely local.
 */
export class ReconnectCommand implements ICommand {
  async run(): Promise<void> {
    const { mqttClient, mqttService, mqttSubscriber } = await import('spark-edge-core');
    const { isProvisioned } = await import('spark-edge-core');

    if (!isProvisioned()) {
      console.error('\n✗ Edge is not provisioned. Run `spark-edge connect` first.\n');
      process.exit(1);
    }

    console.log('\n⚡ SparkEdge — Reconnecting to MQTT broker\n');

    try {
      process.stdout.write('  Reconnecting...');
      const client = await mqttClient.reconnectWithNewCredentials();

      if (!client) {
        console.log('\n✗ Could not connect — check credentials or broker availability.');
        process.exit(1);
      }

      await mqttSubscriber.subscribe();

      process.stdout.write(' Subscribing...');
      await mqttService.publishStatus();
      console.log(' ✓');

      console.log('\n✓ Reconnected successfully.\n');
    } catch (err: any) {
      console.error(`\n✗ Reconnect failed: ${err.message}\n`);
      process.exit(1);
    }
  }
}
