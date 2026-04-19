"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusTopic = getStatusTopic;
exports.getHeartbeatTopic = getHeartbeatTopic;
exports.getCommandTopic = getCommandTopic;
exports.getResponseTopic = getResponseTopic;
exports.getLogTopic = getLogTopic;
exports.getMetricsTopic = getMetricsTopic;
function getStatusTopic(edgeId) {
    return `spark/${edgeId}/status`;
}
function getHeartbeatTopic(edgeId) {
    return `spark/${edgeId}/heartbeat`;
}
function getCommandTopic(edgeId) {
    return `spark/${edgeId}/commands`;
}
function getResponseTopic(edgeId) {
    return `spark/${edgeId}/responses`;
}
function getLogTopic(edgeId) {
    return `spark/${edgeId}/logs`;
}
function getMetricsTopic(edgeId) {
    return `spark/${edgeId}/metrics`;
}
//# sourceMappingURL=mqtt.topics.js.map