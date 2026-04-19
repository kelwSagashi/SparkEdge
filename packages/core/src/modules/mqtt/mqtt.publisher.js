"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = publish;
exports.publishRetained = publishRetained;
const mqtt_client_1 = require("./mqtt.client");
const mqtt_queue_1 = require("./mqtt.queue");
async function publish(topic, payload, options) {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const publishOptions = {
        qos: 1,
        retain: false,
        ...options,
    };
    if (!(0, mqtt_client_1.isConnected)()) {
        console.warn(`[Mqtt] Offline — queuing message for topic: ${topic}`);
        await (0, mqtt_queue_1.enqueue)(topic, serialized);
        return;
    }
    return new Promise((resolve, reject) => {
        (0, mqtt_client_1.getClient)().publish(topic, serialized, publishOptions, (err) => {
            if (err) {
                console.error(`[Mqtt] Publish failed for topic ${topic}:`, err.message);
                (0, mqtt_queue_1.enqueue)(topic, serialized).catch(() => { });
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
async function publishRetained(topic, payload) {
    return publish(topic, payload, { retain: true, qos: 1 });
}
//# sourceMappingURL=mqtt.publisher.js.map