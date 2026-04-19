import { IClientPublishOptions } from 'mqtt';
export declare function publish(topic: string, payload: Record<string, any> | string, options?: Partial<IClientPublishOptions>): Promise<void>;
export declare function publishRetained(topic: string, payload: Record<string, any>): Promise<void>;
