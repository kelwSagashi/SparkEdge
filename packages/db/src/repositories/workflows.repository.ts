import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { WorkflowUpsertValues, WorkflowReturningValues, ReturningQueries } from '../types';

export class WorkflowsRepository {
  constructor(private db: DBType) {}

  create(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.insert(Tables.WorkflowTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.insert(Tables.WorkflowTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.WorkflowTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.WorkflowTable).where(eq(Tables.WorkflowTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<WorkflowReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.WorkflowTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.WorkflowTable).where(eq(Tables.WorkflowTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default WorkflowsRepository;
