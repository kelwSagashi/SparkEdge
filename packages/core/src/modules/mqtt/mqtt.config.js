"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMqttConfig = loadMqttConfig;
const os_1 = __importDefault(require("os"));
function loadMqttConfig() {
    const url = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
    const username = process.env.MQTT_USER;
    const password = process.env.MQTT_PASS;
    const edgeId = process.env.EDGE_ID ?? os_1.default.hostname();
    return {
        url,
        username,
        password,
        edgeId,
        clientId: `edge-${edgeId}`,
        reconnectPeriod: 5000,
        keepalive: 60,
        useTls: url.startsWith('mqtts://'),
    };
}
//# sourceMappingURL=mqtt.config.js.map