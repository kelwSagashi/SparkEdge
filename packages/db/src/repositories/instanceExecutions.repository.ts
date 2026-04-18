import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, desc } from 'drizzle-orm';
import type { InstanceExecutionUpsertValues, InstanceExecutionReturningValues, ReturningQueries } from '../types';

export class InstanceExecutionsRepository {
  constructor(private db: DBType) {}

  create(values: InstanceExecutionUpsertValues): ReturningQueries<InstanceExecutionReturningValues | null> {
    try {
      const data = this.db.insert(Tables.InstanceExecutionsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<InstanceExecutionReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.InstanceExecutionsTable)
        .where(eq(Tables.InstanceExecutionsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByInstance(instance_id: string, limit = 50): ReturningQueries<InstanceExecutionReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstanceExecutionsTable)
        .where(eq(Tables.InstanceExecutionsTable.instance_id, instance_id))
        .orderBy(desc(Tables.InstanceExecutionsTable.created_at))
        .limit(limit)
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listAll(limit = 100): ReturningQueries<InstanceExecutionReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstanceExecutionsTable)
        .orderBy(desc(Tables.InstanceExecutionsTable.created_at))
        .limit(limit)
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  updateStatus(
    id: string,
    status: InstanceExecutionReturningValues['status'],
    extra?: Partial<Pick<InstanceExecutionReturningValues, 'finished_at' | 'duration_ms' | 'error_message' | 'output' | 'destination_sent' | 'fallback_used' | 'logs'>>
  ): ReturningQueries<InstanceExecutionReturningValues | null> {
    try {
      const data = this.db.update(Tables.InstanceExecutionsTable)
        .set({ status, ...extra })
        .where(eq(Tables.InstanceExecutionsTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.InstanceExecutionsTable)
        .where(eq(Tables.InstanceExecutionsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default InstanceExecutionsRepository;





