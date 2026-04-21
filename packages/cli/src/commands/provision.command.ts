import * as readline from 'readline';
import { 
  mqttClient, 
  cloudLogin, 
  registerEdge, 
  setCloudEdgeId, 
  saveMqttCredentials,
  isProvisioned,
  getEdgeId
} from 'spark-edge-core';
import type { ICommand } from './types';

const { reconnectWithNewCredentials } = mqttClient;

/**
 * Interactive CLI provisioning command.
 * Usage: spark-edge provision
 *
 * Authenticates with Spark Cloud (or local simulator) and assigns
 * a unique cloud identity to this device.
 */
export class ProvisionCommand implements ICommand {
  async run(): Promise<void> {
    console.log('\n⚡ SparkEdge — Provisioning Wizard\n');

    if (await isProvisioned()) {
      const currentId = await getEdgeId();
      console.log(`  Status: Already provisioned (ID: ${currentId})`);
      console.log('  Run "disconnect" first if you wish to re-provision.\n');
      return;
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = (question: string): Promise<string> =>
      new Promise((resolve) => rl.question(question, resolve));

    try {
      console.log('  Connecting to Spark Cloud...\n');

      const email = await ask('  Spark Cloud Email: ');
      if (!email.trim()) {
        console.error('\n✗ Email is required. Aborting.\n');
        return;
      }

      const password = await ask('  Spark Cloud Password: ');
      if (!password.trim()) {
        console.error('\n✗ Password is required. Aborting.\n');
        return;
      }

      const edgeName = await ask('  Edge Name (optional, e.g. "Warehouse-01"): ');

      console.log('\n  Authenticating...');
      
      // Use local mock cloud URL by default for this phase, or environment variable
      const sparkApiUrl = process.env.SPARK_API_URL || 'http://localhost:3009/api/spark-cloud';

      // Step 1: Login
      const { token } = await cloudLogin(email.trim(), password.trim(), sparkApiUrl);
      console.log('  ✓ Authenticated successfully.');

      // Step 2: Register
      console.log('  Registering device...');
      const registration = await registerEdge({
        userToken: token,
        edgeName: edgeName.trim() || undefined as any, // Handle optional name
        sparkApiUrl
      });

      // Step 3: Persist
      await setCloudEdgeId(registration.edge_id, registration.edge_name);
      await saveMqttCredentials({
        brokerUrl: registration.mqtt.url,
        username: registration.mqtt.username,
        password: registration.mqtt.password,
      });

      console.log('\n✓ Provisioning complete!');
      console.log(`  New Edge ID: ${registration.edge_id}`);
      console.log(`  Edge Name  : ${registration.edge_name}\n`);

      // Step 4: Reconnect MQTT
      try {
        console.log('  Initializing MQTT service...');
        const newClient = await reconnectWithNewCredentials();
        if (newClient) {
          console.log('  ✓ MQTT client connected successfully.\n');
        }
      } catch (err: any) {
        console.log(`  ! MQTT started but couldn't reach broker: ${err.message}`);
        console.log('    (It will retry in the background)\n');
      }

    } catch (err: any) {
      console.error(`\n✗ Provisioning failed: ${err.message}\n`);
    } finally {
      rl.close();
    }
  }
}
