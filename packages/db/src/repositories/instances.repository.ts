import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, and } from 'drizzle-orm';
import type { InstanceUpsertValues, InstanceReturningValues, ReturningQueries } from '../types';

export class InstancesRepository {
  constructor(private db: DBType) {}

  create(values: InstanceUpsertValues): ReturningQueries<InstanceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.InstancesTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: InstanceUpsertValues): ReturningQueries<InstanceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.InstancesTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.InstancesTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<InstanceReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.InstancesTable).where(eq(Tables.InstancesTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<InstanceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstancesTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listByProject(project_id: string): ReturningQueries<InstanceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstancesTable)
        .where(eq(Tables.InstancesTable.project_id, project_id))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listActive(): ReturningQueries<InstanceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.InstancesTable)
        .where(and(eq(Tables.InstancesTable.active, true)))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  updateStatus(id: string, status: InstanceReturningValues['status']): ReturningQueries<InstanceReturningValues | null> {
    try {
      const data = this.db.update(Tables.InstancesTable)
        .set({ status, updated_at: new Date().toISOString() })
        .where(eq(Tables.InstancesTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  update(id: string, values: Partial<InstanceUpsertValues>): ReturningQueries<InstanceReturningValues | null> {
    try {
      const data = this.db.update(Tables.InstancesTable)
        .set({ ...values, updated_at: new Date().toISOString() })
        .where(eq(Tables.InstancesTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.InstancesTable).where(eq(Tables.InstancesTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default InstancesRepository;





