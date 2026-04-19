export interface QueuedMessage {
    id: string;
    topic: string;
    payload: string;
    attempts: number;
    created_at: string;
}
export declare function enqueue(topic: string, payload: string): Promise<void>;
export declare function retryAll(): Promise<void>;
