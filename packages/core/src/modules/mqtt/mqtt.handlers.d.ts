export interface MqttCommand {
    id: string;
    type: string;
    payload: Record<string, any>;
}
export declare function setCommandDispatcher(fn: (command: MqttCommand) => Promise<void>): void;
export declare function handleCommand(raw: string): Promise<void>;
