/**
 * Defines all MQTT topic templates used by SparkEdge.
 * Format: spark/{edge_id}/{subject}
 */

export function getStatusTopic(edgeId: string): string {
  return `spark/${edgeId}/status`;
}

export function getHeartbeatTopic(edgeId: string): string {
  return `spark/${edgeId}/heartbeat`;
}

export function getCommandTopic(edgeId: string): string {
  return `spark/${edgeId}/commands`;
}

export function getResponseTopic(edgeId: string): string {
  return `spark/${edgeId}/responses`;
}

export function getLogTopic(edgeId: string): string {
  return `spark/${edgeId}/logs`;
}

export function getMetricsTopic(edgeId: string): string {
  return `spark/${edgeId}/metrics`;
}
