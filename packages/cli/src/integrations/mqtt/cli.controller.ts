import { Get, Post, Put, RestController } from 'spark-edge-di';
import { Request, Response } from 'express';
import { sparkEdgeCloudApiUrl } from '../constants';

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
      
      const isComplete = !!(config?.edge_name && config?.lat && config?.lng);

      return res.json({
        complete: isComplete,
        data: config ? {
          name: config.edge_name,
          description: config.description,
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
      const { name, description, lat, lng, tags } = req.body ?? {};
      const { dbManager } = await import('spark-edge-db');
      
      dbManager.edge.upsertEdgeConfig({
        edge_name: name,
        description: description || null,
        lat: lat ? String(lat) : null,
        lng: lng ? String(lng) : null,
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

      // If connected and user available, publish context (keeps cloud in sync)
      const user = (_req as any).user;
      if (mqttConnected && user) {
        try {
          const { mqttService } = await import('spark-edge-core');
          mqttService.publishContext({
            id: user.id || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || ""
          }).catch(() => {});
        } catch { /* best-effort */ }
      }

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

  /** POST /api/cli/pair — pair this edge using a cloud-generated token */
  @Post('/pair')
  async pair(req: Request, res: Response) {
    try {
      const { token, name } = req.body ?? {};

      if (!token) {
        return res.status(400).json({ message: 'O token é obrigatório.' });
      }

      const {
        provisionService,
        pairWithToken,
        lifecycleService,
      } = await import('spark-edge-core');

      const { dbManager } = await import('spark-edge-db');
      const { data: config } = dbManager.edge.getEdgeConfig();

      // Collect system metadata (lazy as well)
      const { collectSystemMetadata } = await import('spark-edge-core');
      const { version } = require('../../../package.json');
      const systemMetadata = await collectSystemMetadata(version);

      const metadata = {
        lat: config?.lat,
        lng: config?.lng,
        tags: config?.tags || [],
        description: config?.description,
        os: systemMetadata.os,
        os_version: systemMetadata.os_version,
        edge_version: systemMetadata.edge_version,
        hardware: systemMetadata.hardware,
        environment: 'production'
      };

      // Use the token to pair with cloud
      const registration = await pairWithToken(token, name || config?.edge_name, metadata);

      // Persist identity and credentials
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

      // Start MQTT
      await lifecycleService.handleReconnect();

      // Immediately publish user context if logged in
      const user = (req as any).user;
      if (user) {
        try {
          const { mqttService } = await import('spark-edge-core');
          await mqttService.publishContext({
            id: user.id || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || ""
          });
        } catch { /* best-effort */ }
      }

      return res.json({
        success: true,
        edge_id: registration.edge_id,
        edge_name: registration.edge_name,
      });
    } catch (err: any) {
      console.error('[CliController] Pairing error:', err);
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

      if (!config?.edge_name) {
        return res.status(400).json({ message: 'Onboarding incompleto. Defina o nome e localização do Edge primeiro.' });
      }

      // Step 1: Authenticate — ephemeral JWT
      const { token } = await cloudLogin(email, password, sparkEdgeCloudApiUrl);

      // Collect system metadata (lazy as well)
      const { collectSystemMetadata } = await import('spark-edge-core');
      const { version } = require('../../../package.json');
      const systemMetadata = await collectSystemMetadata(version);

      // Step 2: Register edge with cloud (sending onboarding data)
      const registration = await registerEdge({
        userToken: token,
        edgeName: config.edge_name,
        metadata: {
          lat: config.lat,
          lng: config.lng,
          tags: config.tags || [],
          description: config.description,
          os: systemMetadata.os,
          os_version: systemMetadata.os_version,
          edge_version: systemMetadata.edge_version,
          hardware: systemMetadata.hardware,
          environment: 'production'
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

      // Immediately publish user context if logged in
      const user = (req as any).user;
      if (user) {
        try {
          const { mqttService } = await import('spark-edge-core');
          await mqttService.publishContext({
            id: user.id || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || ""
          });
        } catch { /* best-effort */ }
      }

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

  /** POST /api/cli/remove — stop MQTT and DELETE all credentials/identity */
  @Post('/remove')
  async remove(_req: Request, res: Response) {
    try {
      const { provisionService, mqttClient, mqttService, unpairWithCloud } = await import('spark-edge-core');
      const { dbManager } = await import('spark-edge-db');

      const edgeData = await provisionService.load();
      if (!edgeData || !edgeData.provisioned) {
        return res.status(400).json({ message: 'Edge não está vinculado ao Cloud — nada para remover.' });
      }

      // 1. Signal Cloud (Synchronous)
      // This informs SparkCloud/API that the device is being removed
      try {
        await unpairWithCloud(edgeData.edge_id);
      } catch (cloudErr: any) {
        console.warn('[CliController] Cloud unpairing signal failed:', cloudErr.message);
        // We continue anyway to wipe local data, or should we block? 
        // User asked for "sincrono entre os sistemas", so we might want to inform if it fails,
        // but local wipe should probably still happens to allow re-onboarding.
      }

      // 2. Stop active connection
      if (mqttClient.isConnected()) {
        try { await mqttService.publishOfflineStatus(); } catch { /* best-effort */ }
        await mqttClient.disconnect();
      }

      // 2. Clear provisioning data (JSON + identity table + mqtt_credentials table)
      await provisionService.clear();

      // 3. Optional: Clear onboarding/config from DB to return to state 1
      dbManager.edge.clearEdgeConfig();

      return res.json({ success: true, message: 'Edge resetado com sucesso (conexão removida).' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
}
