"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = subscribe;
exports.resubscribe = resubscribe;
const mqtt_client_1 = require("./mqtt.client");
const mqtt_topics_1 = require("./mqtt.topics");
const mqtt_config_1 = require("./mqtt.config");
const mqtt_handlers_1 = require("./mqtt.handlers");
async function subscribe() {
    const config = (0, mqtt_config_1.loadMqttConfig)();
    const commandTopic = (0, mqtt_topics_1.getCommandTopic)(config.edgeId);
    const client = (0, mqtt_client_1.getClient)();
    await new Promise((resolve, reject) => {
        client.subscribe(commandTopic, { qos: 1 }, (err) => {
            if (err) {
                console.error('[Mqtt] Subscription failed:', err.message);
                reject(err);
            }
            else {
                console.log(`[Mqtt] Subscribed to ${commandTopic}`);
                resolve();
            }
        });
    });
    client.on('message', (topic, message) => {
        if (topic !== commandTopic)
            return;
        const raw = message.toString();
        console.log(`[Mqtt] Message received on ${topic}`);
        (0, mqtt_handlers_1.handleCommand)(raw).catch((err) => {
            console.error('[Mqtt] Error handling command:', err.message);
        });
    });
}
async function resubscribe() {
    console.log('[Mqtt] Re-subscribing to topics...');
    await subscribe();
}
//# sourceMappingURL=mqtt.subscriber.js.map