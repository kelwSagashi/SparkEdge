import { Service } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import { Logger } from '@/simple-logger';

/**
 * SQLite-backed fallback queue.
 * When the destination endpoint is down (e.g., internet loss on Raspberry Pi),
 * data is stored locally and retried periodically.
 */
@Service()
export class FallbackQueueService {
  private retryIntervalMs = 5 * 60 * 1000; // 5 min default
  private maxRetries = 10;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly logger: Logger) {}

  /**
   * Enqueue data to fallback storage for a given instance.
   */
  async enqueue(instanceId: string, payload: unknown, executionId?: string, destinationId?: string): Promise<void> {
    const now = new Date();
    dbManager.localFallback.create({
      instance_id: instanceId,
      destination_id: destinationId,
      execution_id: executionId,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      status: 'pending',
      retry_count: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
    this.logger.log(`[FallbackQueue] Enqueued data for instance ${instanceId} (Execution: ${executionId || 'none'}, Destination: ${destinationId || 'none'})`);
  }

  /**
   * Attempt to flush all pending items.
   * The sendFn should attempt to send the data to the destination.
   * Returns the number of successfully sent items.
   */
  async flush(sendFn: (instanceId: string, payload: string, destinationId?: string) => Promise<boolean>): Promise<number> {
    const pendingRes = dbManager.localFallback.listPending();
    if (pendingRes.error || !pendingRes.data.length) return 0;

    // Sort by created_at to maintain order for 'active_queue' strategy
    const sortedPending = pendingRes.data.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let sent = 0;
    for (const item of sortedPending) {
      // Find instance to check its retry config
      const instanceRes = dbManager.instances.findById(item.instance_id);
      const instance = instanceRes.data;
      
      const maxRetries = instance?.on_error_config?.max_retries ?? this.maxRetries;

      // Skip items that exceeded max retries
      if ((item.retry_count ?? 0) >= maxRetries) {
        this.logger.log(`[FallbackQueue] Item ${item.id} exceeded max retries (${maxRetries}), skipping`);
        continue;
      }

      // Mark as sending
      dbManager.localFallback.markAsSending(item.id);

      try {
        const success = await sendFn(item.instance_id, item.payload, item.destination_id ?? undefined);
        if (success) {
          dbManager.localFallback.markAsSent(item.id);
          sent++;
          this.logger.log(`[FallbackQueue] Successfully sent item ${item.id}`);
        } else {
          dbManager.localFallback.incrementRetry(item.id, 'Send returned false');
        }
      } catch (error: any) {
        dbManager.localFallback.incrementRetry(item.id, error?.message ?? 'Unknown error');
        this.logger.log(`[FallbackQueue] Failed to send item ${item.id}: ${error?.message}`);
      }
    }

    return sent;
  }

  /**
   * Start periodic retry loop.
   */
  startRetryLoop(sendFn: (instanceId: string, payload: string) => Promise<boolean>): void {
    if (this.timer) return;
    this.timer = setInterval(async () => {
      const sent = await this.flush(sendFn);
      if (sent > 0) {
        this.logger.log(`[FallbackQueue] Retry loop sent ${sent} items`);
      }
    }, this.retryIntervalMs);
    this.logger.log(`[FallbackQueue] Retry loop started (every ${this.retryIntervalMs / 1000}s)`);
  }

  /**
   * Stop the retry loop.
   */
  stopRetryLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.log(`[FallbackQueue] Retry loop stopped`);
    }
  }

  /**
   * Get queue stats.
   */
  getStats(): { pending: number; failed: number; sent: number; total: number } {
    const all = dbManager.localFallback.listAll();
    const items = all.data ?? [];
    return {
      pending: items.filter(i => i.status === 'pending').length,
      failed: items.filter(i => i.status === 'failed').length,
      sent: items.filter(i => i.status === 'sent').length,
      total: items.length,
    };
  }
}

export default FallbackQueueService;

