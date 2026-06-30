// CloudIntegration Configuration
export { appConfig, loadConfig, reloadConfig, saveConfig } from './config/cloud-integration.config';
export type { SparkEdgeConfig, CloudIntegrationConfig, DbConfig, AuthConfig, ServerConfig } from './config/cloud-integration.config';

// MQTT module
export * as mqttClient from './modules/mqtt/mqtt.client';
export * as mqttPublisher from './modules/mqtt/mqtt.publisher';
export * as mqttSubscriber from './modules/mqtt/mqtt.subscriber';
export * as mqttHandlers from './modules/mqtt/mqtt.handlers';
export * as mqttService from './modules/mqtt/mqtt.service';
export * as mqttQueue from './modules/mqtt/mqtt.queue';
export * as mqttTopics from './modules/mqtt/mqtt.topics';
export * as mqttConfig from './modules/mqtt/mqtt.config';
export { provisionService } from './modules/mqtt/provision.service';
export { lifecycleService } from './modules/mqtt/lifecycle.service';
export * as systemStats from './modules/system/stats.collector';

// Named type re-exports
export type { MqttCommand } from './modules/mqtt/mqtt.handlers';
export type { MqttConfig, MqttConfigResult } from './modules/mqtt/mqtt.config';

export type { QueuedMessage } from './modules/mqtt/mqtt.queue';
export type { MqttCredentials } from './modules/mqtt/edge.credentials';
export type { CloudLoginResult, EdgeRegistrationResult } from './modules/mqtt/edge.cloud';

export { getSystemIdentity, getEdgeId, isProvisioned, setCloudEdgeId, clearEdgeIdentity, regenerateEdgeId } from './modules/mqtt/edge.identity';
export { getMqttCredentials, saveMqttCredentials, clearMqttCredentials, ensureDefaultMqttCredentials } from './modules/mqtt/edge.credentials';

// Cloud API client
export { cloudLogin, registerEdge, pairWithToken, unpairWithCloud } from './modules/mqtt/edge.cloud';

// System
export { collectSystemMetadata } from './modules/system/metadata';
export type { SystemMetadata } from './modules/system/metadata';
