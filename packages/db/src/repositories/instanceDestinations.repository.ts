import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, and } from 'drizzle-orm';
import type { InstanceDestinationUpsertValues, InstanceDestinationReturningValues, ReturningQueries } from '../types';

export class InstanceDestinationsRepository {
  constructor(private db: DBType) {}

  create(values: InstanceDestinationUpsertValues): ReturningQueries<InstanceDestinationReturningValues | null> {
    try {
      const data = this.db.insert(Tables.InstanceDestinationsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: InstanceDestinationUpsertValues): ReturningQueries<InstanceDestinationReturningValues | null> {
    try {
      const data = this.db.insert(Tables.InstanceDestinationsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.InstanceDestinationsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<InstanceDestinationReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.InstanceDestinationsTable).where(eq(Tables.InstanceDestinationsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByInstance(instance_id: string): ReturningQueries<InstanceDestinationReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstanceDestinationsTable)
        .where(eq(Tables.InstanceDestinationsTable.instance_id, instance_id))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  update(id: string, values: Partial<InstanceDestinationUpsertValues>): ReturningQueries<InstanceDestinationReturningValues | null> {
    try {
      const data = this.db.update(Tables.InstanceDestinationsTable)
        .set({ ...values, created_at: undefined }) // Prevent overwriting created_at by accident if passed
        .where(eq(Tables.InstanceDestinationsTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.InstanceDestinationsTable).where(eq(Tables.InstanceDestinationsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  deleteByInstance(instance_id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.InstanceDestinationsTable).where(eq(Tables.InstanceDestinationsTable.instance_id, instance_id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default InstanceDestinationsRepository;





