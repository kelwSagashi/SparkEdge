export interface StatusPayload {
    edge_id: string;
    online: boolean;
    timestamp: string;
    system: {
        version: string;
        uptime: number;
    };
    location: {
        lat: string | null;
        lng: string | null;
        source: string;
    };
}
export declare function publishStatus(location?: {
    lat: string | null;
    lng: string | null;
    source: string;
}): Promise<void>;
export declare function publishOfflineStatus(): Promise<void>;
export declare function publishHeartbeat(): Promise<void>;
export declare function publishResponse(commandId: string, status: 'done' | 'error' | 'running', result?: Record<string, any> | null, error?: string): Promise<void>;
export declare function publishLog(message: string, level?: 'info' | 'warn' | 'error'): Promise<void>;
export declare function startHeartbeat(): void;
export declare function startQueueRetry(): void;
export declare function stopTimers(): void;
