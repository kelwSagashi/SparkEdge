import * as readline from 'readline';
import type { ICommand } from './types';

/**
 * `spark-edge connect`
 *
 * Connects this Edge instance to the Spark cloud:
 *  1. Prompt user for Spark cloud credentials (email + password)
 *  2. Authenticate → get ephemeral JWT (never stored)
 *  3. Register this Edge → receive permanent MQTT credentials + edge_id
 *  4. Save edge_id and credentials locally
 *  5. Start MQTT connection immediately
 *
 * If the edge is already connected, this command exits with an error.
 */
export class ConnectCommand implements ICommand {
  async run(): Promise<void> {
    // Lazy imports to avoid circular deps at module load time
    const { isProvisioned, setCloudEdgeId } = await import('spark-edge-core');
    const { saveMqttCredentials } = await import('spark-edge-core');
    const { cloudLogin, registerEdge } = await import('spark-edge-core');
    const { mqttClient, mqttSubscriber } = await import('spark-edge-core');

    // Guard: block re-registration without disconnect first
    if (await isProvisioned()) {
      console.error('\n✗ This Edge is already connected to Spark.');
      console.error('  Run `spark-edge disconnect` first to re-register.\n');
      process.exit(1);
    }

    console.log('\n⚡ SparkEdge — Connecting to Spark Cloud\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string): Promise<string> => new Promise((resolve) => rl.question(q, resolve));
    const askHidden = (q: string): Promise<string> =>
      new Promise((resolve) => {
        process.stdout.write(q);
        process.stdin.setRawMode?.(true);
        process.stdin.resume();
        let input = '';
        process.stdin.on('data', function handler(char: Buffer) {
          const c = char.toString();
          if (c === '\r' || c === '\n') {
            process.stdin.setRawMode?.(false);
            process.stdin.pause();
            process.stdin.removeListener('data', handler);
            process.stdout.write('\n');
            resolve(input);
          } else if (c === '\u0003') {
            process.exit(0);
          } else if (c === '\u007f' || c === '\b') {
            if (input.length > 0) input = input.slice(0, -1);
          } else {
            input += c;
            process.stdout.write('*');
          }
        });
      });

    try {
      const sparkApiUrl = process.env.SPARK_API_URL || 'http://localhost:3009/api/spark-cloud';
      const email = await ask('  Spark email: ');
      if (!email.trim()) { console.error('\n✗ Email is required.\n'); return; }

      const password = await askHidden('  Spark password: ');
      if (!password) { console.error('\n✗ Password is required.\n'); return; }

      const edgeName = await ask('  Edge name (e.g. "Edge Casa João"): ');
      if (!edgeName.trim()) { console.error('\n✗ Edge name is required.\n'); return; }

      rl.close();

      // Step 1: Authenticate (ephemeral — JWT never stored to disk)
      process.stdout.write('\n  Authenticating with Spark...');
      const { token } = await cloudLogin(email.trim(), password, sparkApiUrl);
      console.log(' ✓');

      // Step 2: Register edge with cloud
      process.stdout.write('  Registering Edge instance...');
      const registration = await registerEdge({
        userToken: token,
        edgeName: edgeName.trim(),
        sparkApiUrl,
      });
      console.log(' ✓');

      // Step 3: Save identity and credentials locally
      await setCloudEdgeId(registration.edge_id, registration.edge_name);
      await saveMqttCredentials({
        brokerUrl: registration.mqtt.url,
        username: registration.mqtt.username,
        password: registration.mqtt.password,
      });

      // Step 4: Start MQTT immediately
      process.stdout.write('  Connecting to MQTT broker...');
      const client = await mqttClient.connect();
      if (client) {
        await mqttSubscriber.subscribe();
        // Publish initial online status
        const { mqttService } = await import('spark-edge-core');
        await mqttService.publishStatus();
        console.log(' ✓');
        mqttService.startHeartbeat();
      } else {
        console.log(' ⚠ Could not connect (will retry automatically)');
      }

      console.log(`\n✓ Edge connected successfully!`);
      console.log(`  Edge ID   : ${registration.edge_id}`);
      console.log(`  Edge Name : ${registration.edge_name}`);
      console.log(`  Broker    : ${registration.mqtt.url}\n`);
    } catch (err: any) {
      rl.close();
      console.error(`\n✗ Connection failed: ${err.message}\n`);
      process.exit(1);
    }
  }
}
