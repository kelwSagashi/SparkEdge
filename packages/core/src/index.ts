// MQTT module
export * as mqttClient from './modules/mqtt/mqtt.client';
export * as mqttPublisher from './modules/mqtt/mqtt.publisher';
export * as mqttSubscriber from './modules/mqtt/mqtt.subscriber';
export * as mqttHandlers from './modules/mqtt/mqtt.handlers';
export * as mqttService from './modules/mqtt/mqtt.service';
export * as mqttQueue from './modules/mqtt/mqtt.queue';
export * as mqttTopics from './modules/mqtt/mqtt.topics';
export * as mqttConfig from './modules/mqtt/mqtt.config';

// Named type re-exports
export type { MqttCommand } from './modules/mqtt/mqtt.handlers';
export type { MqttConfig, MqttConfigResult } from './modules/mqtt/mqtt.config';
export type { StatusPayload } from './modules/mqtt/mqtt.service';
export type { QueuedMessage } from './modules/mqtt/mqtt.queue';
export type { MqttCredentials } from './modules/mqtt/edge.credentials';
export type { CloudLoginResult, EdgeRegistrationResult } from './modules/mqtt/edge.cloud';

// Edge identity & credentials
export { getOrCreateEdgeId, isProvisioned, setCloudEdgeId, clearEdgeIdentity } from './modules/mqtt/edge.identity';
export { getMqttCredentials, saveMqttCredentials, clearMqttCredentials } from './modules/mqtt/edge.credentials';

// Cloud API client
export { cloudLogin, registerEdge } from './modules/mqtt/edge.cloud';
