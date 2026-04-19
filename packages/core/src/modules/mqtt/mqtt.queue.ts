import { dbManager } from 'spark-edge-db';
import { publish } from './mqtt.publisher';

/**
 * Lightweight local queue backed by SQLite (via @spark-edge/db).
 * Stores messages that couldn't be delivered when the broker is offline.
 */

export interface QueuedMessage {
  id: string;
  topic: string;
  payload: string;
  attempts: number;
  created_at: string;
}

export async function enqueue(topic: string, payload: string): Promise<void> {
  dbManager.edge.enqueue({ topic, payload });
}

const MAX_ATTEMPTS = 10;

/**
 * Retry all pending messages in the queue.
 * Called periodically by the lifecycle manager.
 */
export async function retryAll(): Promise<void> {
  const result = dbManager.edge.listQueue(MAX_ATTEMPTS);
  const rows = result.data || [];

  if (rows.length === 0) return;

  console.log(`[Mqtt] Retrying ${rows.length} queued message(s)...`);

  for (const row of rows) {
    try {
      await publish(row.topic, row.payload);
      // Success — remove from queue
      dbManager.edge.deleteQueueItem(row.id);
    } catch {
      // Increment attempt counter
      dbManager.edge.incrementQueueAttempt(row.id);

      // Check if we should drop it now
      if ((row.attempts || 0) + 1 >= MAX_ATTEMPTS) {
        console.warn(`[Mqtt] Dropping message to ${row.topic} after ${MAX_ATTEMPTS} failed attempts.`);
        dbManager.edge.deleteQueueItem(row.id);
      }
    }
  }
}
