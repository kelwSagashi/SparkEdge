import { MqttClient } from 'mqtt';
export declare function getClient(): MqttClient;
export declare function isConnected(): boolean;
export declare function connect(): Promise<MqttClient>;
export declare function disconnect(): Promise<void>;
