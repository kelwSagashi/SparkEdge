import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { LocalFallbackItemUpsertValues, LocalFallbackItemReturningValues, ReturningQueries } from '../types';

export class LocalFallbackStorageRepository {
  constructor(private db: DBType) {}

  create(values: LocalFallbackItemUpsertValues): ReturningQueries<LocalFallbackItemReturningValues | null> {
    try {
      const data = this.db.insert(Tables.LocalFallbackStorageTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<LocalFallbackItemReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.LocalFallbackStorageTable)
        .where(eq(Tables.LocalFallbackStorageTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listPending(): ReturningQueries<LocalFallbackItemReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.LocalFallbackStorageTable)
        .where(eq(Tables.LocalFallbackStorageTable.status, 'pending'))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listByInstance(instance_id: string): ReturningQueries<LocalFallbackItemReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.LocalFallbackStorageTable)
        .where(eq(Tables.LocalFallbackStorageTable.instance_id, instance_id))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listAll(): ReturningQueries<LocalFallbackItemReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.LocalFallbackStorageTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  markAsSending(id: string): ReturningQueries<LocalFallbackItemReturningValues | null> {
    try {
      const data = this.db.update(Tables.LocalFallbackStorageTable)
        .set({ status: 'sending', updated_at: new Date().toISOString() })
        .where(eq(Tables.LocalFallbackStorageTable.id, id))
        .returning().get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  markAsSent(id: string): ReturningQueries<LocalFallbackItemReturningValues | null> {
    try {
      const data = this.db.update(Tables.LocalFallbackStorageTable)
        .set({ status: 'sent', updated_at: new Date().toISOString() })
        .where(eq(Tables.LocalFallbackStorageTable.id, id))
        .returning().get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  incrementRetry(id: string, last_error?: string): ReturningQueries<LocalFallbackItemReturningValues | null> {
    try {
      const existing = this.db.select().from(Tables.LocalFallbackStorageTable)
        .where(eq(Tables.LocalFallbackStorageTable.id, id)).get();
      if (!existing) return { data: null };

      const now = new Date();
      const nextRetryAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 min default backoff

      const data = this.db.update(Tables.LocalFallbackStorageTable)
        .set({
          status: 'failed',
          retry_count: (existing.retry_count ?? 0) + 1,
          last_retry_at: now.toISOString(),
          next_retry_at: nextRetryAt,
          last_error: last_error ?? null,
          updated_at: now.toISOString(),
        })
        .where(eq(Tables.LocalFallbackStorageTable.id, id))
        .returning().get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.LocalFallbackStorageTable)
        .where(eq(Tables.LocalFallbackStorageTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default LocalFallbackStorageRepository;
