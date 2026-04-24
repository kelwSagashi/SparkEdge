import * as readline from 'readline';
import type { ICommand } from './types';
import { sparkApiUrl } from '@/integrations/constants';

/**
 * `spark-edge pair <token>`
 *
 * Connects this Edge instance to Spark using a pairing token:
 *  1. Use token to register edge with cloud
 *  2. Receive permanent MQTT credentials + edge_id
 *  3. Save edge_id and credentials locally
 *  4. Start MQTT connection immediately
 */
export class PairCommand implements ICommand {
  async run(args?: string[]): Promise<void> {
    const pairingToken = args?.[0];

    // Lazy imports
    const { isProvisioned, setCloudEdgeId } = await import('spark-edge-core');
    const { saveMqttCredentials, clearEdgeIdentity } = await import('spark-edge-core');
    const { clearMqttCredentials, pairWithToken } = await import('spark-edge-core');
    const { mqttClient, mqttSubscriber, mqttService } = await import('spark-edge-core');

    if (await isProvisioned()) {
      console.log('\n  Edge is already provisioned — removing previous identity first...');
      
      if (mqttClient.isConnected()) {
        try { await mqttService.publishOfflineStatus(); } catch {}
        await mqttClient.disconnect();
      }
      
      await clearMqttCredentials();
      await clearEdgeIdentity();
    }

    let token = pairingToken;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string): Promise<string> => new Promise((resolve) => rl.question(q, resolve));

    try {
      if (!token) {
        console.log('\n⚡ SparkEdge — Pairing with Token\n');
        token = await ask('  Enter pairing token: ');
        if (!token || !token.trim()) {
          console.error('\n✗ Pairing token is required.\n');
          rl.close();
          return;
        }
      }

      const { collectSystemMetadata } = await import('spark-edge-core');
      const { version } = require('../../package.json');
      
      const edgeNameInput = await ask(`  Edge Name (default: SparkEdge-new): `);
      const edgeName = edgeNameInput.trim() || `SparkEdge-new`;
      
      const descriptionInput = await ask(`  Edge Description (optional): `);
      const description = descriptionInput.trim() || null;

      const lat = await ask('  Latitude (optional): ');
      const lng = await ask('  Longitude (optional): ');
      const tagsInput = await ask('  Tags (comma separated, optional): ');
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
      
      const systemMetadata = await collectSystemMetadata(version);
      const metadata = {
        lat: lat || null,
        lng: lng || null,
        tags,
        os: systemMetadata.os,
        os_version: systemMetadata.os_version,
        edge_version: systemMetadata.edge_version,
        hardware: systemMetadata.hardware,
        environment: 'production',
        description: description || `Edge running on ${systemMetadata.hostname}`
      };

      process.stdout.write('\n  Verifying pairing token and registering metadata...');
      const registration = await pairWithToken(token.trim(), edgeName, metadata);
      console.log(' ✓');


      // Save identity and config locally
      const { dbManager } = await import('spark-edge-db');
      await dbManager.edge.upsertEdgeConfig({
        edge_name: edgeName,
        lat: metadata.lat,
        lng: metadata.lng,
        location_source: 'manual',
        tags: metadata.tags,
        os: metadata.os,
        os_version: metadata.os_version,
        edge_version: metadata.edge_version,
        hardware: metadata.hardware,
        description: metadata.description
      });
      await saveMqttCredentials({
        brokerUrl: registration.mqtt.url,
        username: registration.mqtt.username,
        password: registration.mqtt.password,
      });

      // Start MQTT
      process.stdout.write('  Connecting to MQTT broker...');
      const client = await mqttClient.connect();
      if (client) {
        await mqttSubscriber.subscribe();
        await mqttService.publishStatus();
        console.log(' ✓');
        mqttService.startHeartbeat();
      } else {
        console.log(' ⚠ Could not connect (will retry automatically)');
      }

      console.log(`\n✓ Edge paired successfully!`);
      console.log(`  Edge ID     : ${registration.edge_id}`);
      console.log(`  Edge Name   : ${registration.edge_name}`);
      console.log(`  Cloud URL   : ${sparkApiUrl}\n`);
      
      rl.close();
    } catch (err: any) {
      rl.close();
      console.error(`\n✗ Pairing failed: ${err.message}\n`);
      process.exit(1);
    }
  }
}
