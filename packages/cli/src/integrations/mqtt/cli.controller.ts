import { Get, Post, Put, RestController } from '@spark-edge/di';
import { Request, Response } from 'express';

/**
 * /api/cli/* — Edge Cloud Management endpoints
 *
 * Consumed only by the local frontend UI.
 */
@RestController('/cli')
export class CliController {

  /** GET /api/cli/onboarding — check if local onboarding is complete */
  @Get('/onboarding')
  async getOnboarding(_req: Request, res: Response) {
    try {
      const { dbManager } = await import('spark-edge-db');
      const { data: config } = dbManager.edge.getEdgeConfig();
      
      const isComplete = !!(config?.name && config?.lat && config?.lng);

      return res.json({
        complete: isComplete,
        data: config ? {
          name: config.name,
          lat: config.lat,
          lng: config.lng,
          tags: config.tags || [],
        } : null
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/onboarding — save local onboarding data */
  @Post('/onboarding')
  async saveOnboarding(req: Request, res: Response) {
    try {
      const { name, lat, lng, tags } = req.body ?? {};
      const { dbManager } = await import('spark-edge-db');
      
      dbManager.edge.upsertEdgeConfig({
        name,
        lat: String(lat),
        lng: String(lng),
        tags: Array.isArray(tags) ? tags : [],
        location_source: 'manual'
      });

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** GET /api/cli/status — check provisioning + MQTT connection state */
  @Get('/status')
  async getStatus(_req: Request, res: Response) {
    try {
      const { provisionService, mqttClient } = await import('spark-edge-core');
      const edgeData = await provisionService.load();
      const mqttConnected = mqttClient.isConnected();

      return res.json({
        connected: !!edgeData?.provisioned,
        edge_id: edgeData?.edge_id || null,
        edge_name: edgeData?.edge_name || null,
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
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        return res.status(400).json({ message: 'email e password são obrigatórios.' });
      }

      const {
        provisionService,
        cloudLogin,
        registerEdge,
        lifecycleService,
      } = await import('spark-edge-core');

      const { dbManager } = await import('spark-edge-db');
      const { data: config } = dbManager.edge.getEdgeConfig();

      if (!config?.name) {
        return res.status(400).json({ message: 'Onboarding incompleto. Defina o nome e localização do Edge primeiro.' });
      }

      const sparkApiUrl = process.env.SPARK_API_URL || 'http://localhost:3009/api/spark-cloud';

      // Step 1: Authenticate — ephemeral JWT
      const { token } = await cloudLogin(email, password, sparkApiUrl);

      // Step 2: Register edge with cloud (sending onboarding data)
      const registration = await registerEdge({
        userToken: token,
        edgeName: config.name,
        sparkApiUrl,
        metadata: {
          lat: config.lat,
          lng: config.lng,
          tags: config.tags || [],
        }
      });

      // Step 3: Persist identity and credentials locally (JSON + DB)
      await provisionService.save({
        edge_id: registration.edge_id,
        edge_name: registration.edge_name,
        mqtt: {
          url: registration.mqtt.url,
          username: registration.mqtt.username,
          password: registration.mqtt.password,
        },
        provisioned: true,
      });

      // Step 4: Start MQTT using the lifecycle service
      await lifecycleService.handleReconnect();

      return res.json({
        success: true,
        edge_id: registration.edge_id,
        edge_name: registration.edge_name,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/disconnect — stop MQTT but KEEP credentials */
  @Post('/disconnect')
  async disconnect(_req: Request, res: Response) {
    try {
      const { provisionService, mqttClient, mqttService } = await import('spark-edge-core');

      if (!(await provisionService.isProvisioned())) {
        return res.json({ success: true, message: 'Não estava conectado.' });
      }

      if (mqttClient.isConnected()) {
        try { await mqttService.publishOfflineStatus(); } catch { /* best-effort */ }
        await mqttClient.disconnect();
      }

      // Note: We NO LONGER clear credentials. 
      // Disconnect just stops the active connection.

      return res.json({ success: true, message: 'Edge desconectado (identidade preservada).' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  /** POST /api/cli/reconnect — force MQTT reconnection using stored credentials */
  @Post('/reconnect')
  async reconnect(_req: Request, res: Response) {
    try {
      const { provisionService, lifecycleService } = await import('spark-edge-core');

      if (!(await provisionService.isProvisioned())) {
        return res.status(400).json({ message: 'Edge não provisionado. Conecte-se ao Spark Cloud primeiro.' });
      }

      const success = await lifecycleService.handleReconnect();
      
      if (!success) {
        return res.status(503).json({ message: 'Falha ao conectar. Verifique sua conexão.' });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}
