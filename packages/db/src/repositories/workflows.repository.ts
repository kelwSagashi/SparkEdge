import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { WorkflowUpsertValues, WorkflowReturningValues, ReturningQueries } from '../types';

export class WorkflowsRepository {
  constructor(private db: DBType) {}

  create(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.insert(Tables.Workflow).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.insert(Tables.Workflow)
        .values(values)
        .onConflictDoUpdate({ target: Tables.Workflow.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<WorkflowReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.Workflow).where(eq(Tables.Workflow.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<WorkflowReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.Workflow).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.Workflow).where(eq(Tables.Workflow.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default WorkflowsRepository;
