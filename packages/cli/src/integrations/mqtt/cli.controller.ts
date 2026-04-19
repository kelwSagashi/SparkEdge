import { Get, Post, RestController } from '@spark-edge/di';
import { Request, Response } from 'express';

/**
 * /api/cli/* — Edge Cloud Management endpoints
 *
 * Consumed only by the local frontend UI.
 * Credentials are NEVER returned or logged in responses.
 */
@RestController('/cli')
export class CliController {

  /** GET /api/cli/status — check provisioning + MQTT connection state */
  @Get('/status')
  async getStatus(_req: Request, res: Response) {
    try {
      const { isProvisioned, getOrCreateEdgeId, mqttClient } = await import('spark-edge-core');
      const provisioned = isProvisioned();
      const edgeId = provisioned ? getOrCreateEdgeId() : null;
      const mqttConnected = mqttClient.isConnected();

      return res.json({
        connected: provisioned,
        edge_id: edgeId,
        mqtt: { connected: mqttConnected },
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/connect — authenticate with Spark and register this edge */
  @Post('/connect')
  async connect(req: Request, res: Response) {
    try {
      const { email, password, edge_name } = req.body ?? {};

      if (!email || !password) {
        return res.status(400).json({ message: 'email e password são obrigatórios.' });
      }

      const {
        isProvisioned,
        setCloudEdgeId,
        saveMqttCredentials,
        cloudLogin,
        registerEdge,
        mqttClient,
        mqttSubscriber,
        mqttService,
      } = await import('spark-edge-core');

      if (isProvisioned()) {
        return res.status(409).json({
          message: 'Este Edge já está conectado ao Spark. Execute disconnect primeiro.',
        });
      }

      const sparkApiUrl = process.env.SPARK_API_URL;

      // Step 1: Authenticate — ephemeral JWT (never stored)
      const { token } = await cloudLogin(email, password, sparkApiUrl);

      // Step 2: Register edge with cloud
      const resolvedName = edge_name?.trim() || `Edge ${new Date().toLocaleDateString('pt-BR')}`;
      const registration = await registerEdge({
        userToken: token,
        edgeName: resolvedName,
        sparkApiUrl,
      });

      // Step 3: Persist identity and credentials locally
      setCloudEdgeId(registration.edge_id, registration.edge_name);
      saveMqttCredentials({
        brokerUrl: registration.mqtt.url,
        username: registration.mqtt.username,
        password: registration.mqtt.password,
      });

      // Step 4: Start MQTT immediately
      let mqttConnected = false;
      try {
        const client = await mqttClient.connect();
        if (client) {
          await mqttSubscriber.subscribe();
          await mqttService.publishStatus();
          mqttService.startHeartbeat();
          mqttService.startQueueRetry();
          mqttConnected = true;
        }
      } catch {
        // MQTT failure is non-fatal — edge is registered, will retry
      }

      return res.json({
        success: true,
        edge_id: registration.edge_id,
        edge_name: registration.edge_name,
        mqtt: { connected: mqttConnected },
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/disconnect — remove credentials and stop MQTT */
  @Post('/disconnect')
  async disconnect(_req: Request, res: Response) {
    try {
      const { isProvisioned, clearEdgeIdentity, clearMqttCredentials, mqttClient, mqttService } =
        await import('spark-edge-core');

      if (!isProvisioned()) {
        return res.json({ success: true, message: 'Não estava conectado.' });
      }

      if (mqttClient.isConnected()) {
        try { await mqttService.publishOfflineStatus(); } catch { /* best-effort */ }
        await mqttClient.disconnect();
      }

      clearMqttCredentials();
      clearEdgeIdentity();

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/reconnect — force MQTT reconnection using stored credentials */
  @Post('/reconnect')
  async reconnect(_req: Request, res: Response) {
    try {
      const { isProvisioned, mqttClient, mqttSubscriber, mqttService } =
        await import('spark-edge-core');

      if (!isProvisioned()) {
        return res.status(400).json({ message: 'Edge não provisionado. Execute connect primeiro.' });
      }

      const client = await mqttClient.reconnectWithNewCredentials();
      if (!client) {
        return res
          .status(503)
          .json({ message: 'Não foi possível conectar ao broker. Verifique as credenciais.' });
      }

      await mqttSubscriber.subscribe();
      await mqttService.publishStatus();

      return res.json({ success: true, mqtt: { connected: true } });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}
