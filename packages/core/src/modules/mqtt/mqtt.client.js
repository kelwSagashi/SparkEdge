"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = getClient;
exports.isConnected = isConnected;
exports.connect = connect;
exports.disconnect = disconnect;
const mqtt_1 = __importDefault(require("mqtt"));
const mqtt_config_1 = require("./mqtt.config");
const mqtt_topics_1 = require("./mqtt.topics");
let client = null;
let connected = false;
function getClient() {
    if (!client) {
        throw new Error('[Mqtt] Client not initialized. Call connect() first.');
    }
    return client;
}
function isConnected() {
    return connected;
}
async function connect() {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const statusTopic = (0, mqtt_topics_1.getStatusTopic)(config.edgeId);
    const options = {
        clientId: config.clientId,
        username: config.username,
        password: config.password,
        reconnectPeriod: config.reconnectPeriod,
        keepalive: config.keepalive,
        clean: true,
        will: {
            topic: statusTopic,
            payload: Buffer.from(JSON.stringify({ online: false, edge_id: config.edgeId })),
            qos: 1,
            retain: true,
        },
    };
    return new Promise((resolve, reject) => {
        console.log(`[Mqtt] Connecting to ${config.url} as ${config.clientId}...`);
        client = mqtt_1.default.connect(config.url, options);
        client.on('connect', () => {
            connected = true;
            console.log('[Mqtt] Connected');
            resolve(client);
        });
        client.on('reconnect', () => {
            console.log('[Mqtt] Reconnecting...');
        });
        client.on('close', () => {
            connected = false;
            console.log('[Mqtt] Disconnected');
        });
        client.on('error', (err) => {
            console.error('[Mqtt] Connection error:', err.message);
            if (!connected) {
                reject(err);
            }
        });
        setTimeout(() => {
            if (!connected) {
                reject(new Error('[Mqtt] Connection timeout'));
            }
        }, 15_000);
    });
}
async function disconnect() {
    return new Promise((resolve) => {
        if (!client) {
            resolve();
            return;
        }
        client.end(false, {}, () => {
            connected = false;
            client = null;
            resolve();
        });
    });
}
//# sourceMappingURL=mqtt.client.js.map