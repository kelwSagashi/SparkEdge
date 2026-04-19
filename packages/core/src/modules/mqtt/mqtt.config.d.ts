export interface MqttConfig {
    url: string;
    username?: string;
    password?: string;
    edgeId: string;
    clientId: string;
    reconnectPeriod: number;
    keepalive: number;
    useTls: boolean;
}
export declare function loadMqttConfig(): MqttConfig;
