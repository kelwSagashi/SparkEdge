import { getOrCreateEdgeId } from './edge.identity';
import { getMqttCredentials } from './edge.credentials';

export interface MqttConfig {
  url: string;
  username?: string;
  password?: string;
  edgeId: string;
  clientId: string;
  reconnectPeriod: number;
  keepalive: number;
  useTls: boolean;
}

export interface MqttConfigResult {
  enabled: boolean;
  config?: MqttConfig;
  reason?: string;
}

/**
 * Builds the MQTT configuration dynamically.
 *
 * - edge_id comes from persistent local DB (never from env).
 * - Credentials come from DB; fall back to .env for dev.
 * - Returns { enabled: false } if no valid config is available.
 */
export function loadMqttConfig(): MqttConfigResult {
  const edgeId = getOrCreateEdgeId();
  const credentials = getMqttCredentials();

  if (!credentials) {
    const reason = 'MQTT disabled: missing credentials (run `spark-edge provision` to configure)';
    console.log(`[Mqtt] ${reason}`);
    return { enabled: false, reason };
  }

  const { brokerUrl, username, password } = credentials;

  console.log(`[Mqtt] Enabled (edge_id=${edgeId}, broker=${brokerUrl})`);

  return {
    enabled: true,
    config: {
      url: brokerUrl,
      username,
      password,
      edgeId,
      clientId: `edge-${edgeId}`,
      reconnectPeriod: 5000,
      keepalive: 60,
      useTls: brokerUrl.startsWith('mqtts://'),
    },
  };
}
