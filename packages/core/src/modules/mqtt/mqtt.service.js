"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishStatus = publishStatus;
exports.publishOfflineStatus = publishOfflineStatus;
exports.publishHeartbeat = publishHeartbeat;
exports.publishResponse = publishResponse;
exports.publishLog = publishLog;
exports.startHeartbeat = startHeartbeat;
exports.startQueueRetry = startQueueRetry;
exports.stopTimers = stopTimers;
const mqtt_config_1 = require("./mqtt.config");
const topics = __importStar(require("./mqtt.topics"));
const mqtt_publisher_1 = require("./mqtt.publisher");
const mqtt_queue_1 = require("./mqtt.queue");
let heartbeatTimer = null;
let queueRetryTimer = null;
function buildStatusPayload(online, location) {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    return {
        edge_id: config.edgeId,
        online,
        timestamp: new Date().toISOString(),
        system: {
            version: process.env.npm_package_version ?? '0.0.0',
            uptime: process.uptime(),
        },
        location: location ?? { lat: null, lng: null, source: 'none' },
    };
}
async function publishStatus(location) {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const topic = topics.getStatusTopic(config.edgeId);
    const payload = buildStatusPayload(true, location);
    await (0, mqtt_publisher_1.publishRetained)(topic, payload);
}
async function publishOfflineStatus() {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const topic = topics.getStatusTopic(config.edgeId);
    const payload = buildStatusPayload(false);
    await (0, mqtt_publisher_1.publishRetained)(topic, payload);
}
async function publishHeartbeat() {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const topic = topics.getHeartbeatTopic(config.edgeId);
    await (0, mqtt_publisher_1.publish)(topic, { timestamp: new Date().toISOString() });
}
async function publishResponse(commandId, status, result, error) {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const topic = topics.getResponseTopic(config.edgeId);
    await (0, mqtt_publisher_1.publish)(topic, {
        command_id: commandId,
        status,
        result: result ?? null,
        error: error ?? null,
        timestamp: new Date().toISOString(),
    });
}
async function publishLog(message, level = 'info') {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const topic = topics.getLogTopic(config.edgeId);
    await (0, mqtt_publisher_1.publish)(topic, { level, message, timestamp: new Date().toISOString() });
}
function startHeartbeat() {
    if (heartbeatTimer)
        return;
    heartbeatTimer = setInterval(async () => {
        try {
            await publishHeartbeat();
        }
        catch {
        }
    }, 30_000);
    console.log('[Mqtt] Heartbeat started (30s interval)');
}
function startQueueRetry() {
    if (queueRetryTimer)
        return;
    queueRetryTimer = setInterval(async () => {
        try {
            await (0, mqtt_queue_1.retryAll)();
        }
        catch {
        }
    }, 60_000);
    console.log('[Mqtt] Queue retry started (60s interval)');
}
function stopTimers() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
    if (queueRetryTimer) {
        clearInterval(queueRetryTimer);
        queueRetryTimer = null;
    }
}
//# sourceMappingURL=mqtt.service.js.map