import * as mqttClient  from './mqtt.client';
import * as mqttService from './mqtt.service';
import * as mqttSubscriber from './mqtt.subscriber';
import { provisionService } from './provision.service';

/**
 * Manages the high-level lifecycle of the Spark Edge application.
 */
export const lifecycleService = {
  /**
   * Executed on server startup.
   * If the edge is already provisioned, it automatically connects to MQTT.
   */
  async boot(): Promise<void> {
    console.log('[Lifecycle] Starting Spark Edge boot sequence...');
    
    const isProv = await provisionService.isProvisioned();
    if (isProv) {
      console.log('[Lifecycle] Edge is provisioned. Attempting auto-connect to Spark Cloud...');
      try {
        const client = await mqttClient.connect();
        if (client) {
          await mqttSubscriber.subscribe();
          await mqttService.publishStatus();
          mqttService.startHeartbeat();
          mqttService.startQueueRetry();
          mqttService.startStatsInterval();
          console.log('[Lifecycle] Auto-connect successful.');
        }
      } catch (err: any) {
        console.error('[Lifecycle] Auto-connect failed:', err.message);
        console.log('[Lifecycle] Auto-reconnect is active. MQTT will retry in background.');
      }
    } else {
      console.log('[Lifecycle] Edge is NOT provisioned. Waiting for onboarding.');
    }
  },

  /**
   * Handle manual reconnection trigger.
   */
  async handleReconnect(): Promise<boolean> {
    const client = await mqttClient.reconnectWithNewCredentials();
    if (client) {
      await mqttSubscriber.subscribe();
      await mqttService.publishStatus();
      mqttService.startHeartbeat();
      mqttService.startQueueRetry();
      mqttService.startStatsInterval();
      return true;
    }
    return false;
  }
};
