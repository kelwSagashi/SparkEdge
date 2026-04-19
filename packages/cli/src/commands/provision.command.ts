import * as readline from 'readline';
import { mqttClient, getOrCreateEdgeId, saveMqttCredentials } from 'spark-edge-core';
import type { ICommand } from './types';

const { reconnectWithNewCredentials } = mqttClient;

/**
 * Interactive CLI provisioning command.
 * Usage: spark-edge provision
 *
 * Prompts the user for MQTT credentials, saves them to the local DB,
 * and reconnects the MQTT client if already running.
 */
export class ProvisionCommand implements ICommand {
  async run(): Promise<void> {
    console.log('\n⚡ SparkEdge — Provisioning Wizard\n');

    const edgeId = getOrCreateEdgeId();
    console.log(`  Edge ID : ${edgeId}`);
    console.log('  This ID is permanent and uniquely identifies this device.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = (question: string): Promise<string> =>
      new Promise((resolve) => rl.question(question, resolve));

    try {
      const brokerUrl = await ask('  MQTT Broker URL (e.g. mqtt://broker.example.com:1883): ');
      if (!brokerUrl.trim()) {
        console.error('\n✗ Broker URL is required. Aborting.\n');
        return;
      }

      const username = await ask('  Username (leave blank for anonymous): ');
      const password = username.trim()
        ? await ask('  Password: ')
        : '';

      saveMqttCredentials({
        brokerUrl: brokerUrl.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
      });

      console.log('\n✓ Credentials saved successfully.\n');

      // If the MQTT client is already running, reconnect with new credentials
      try {
        const newClient = await reconnectWithNewCredentials();
        if (newClient) {
          console.log('✓ MQTT client reconnected with new credentials.\n');
        }
      } catch {
        console.log('  (MQTT will connect on next startup)\n');
      }
    } finally {
      rl.close();
    }
  }
}
