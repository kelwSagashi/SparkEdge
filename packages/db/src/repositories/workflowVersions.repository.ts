import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { WorkflowVersionUpsertValues, WorkflowVersionReturningValues, ReturningQueries } from '../types';

export class WorkflowVersionsRepository {
  constructor(private db: DBType) {}

  create(values: WorkflowVersionUpsertValues): ReturningQueries<WorkflowVersionReturningValues | null> {
    try {
      const data = this.db.insert(Tables.WorkflowVersionsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByWorkflow(workflow_id: string): ReturningQueries<WorkflowVersionReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.WorkflowVersionsTable).where(eq(Tables.WorkflowVersionsTable.workflow_id, workflow_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  findById(id: string): ReturningQueries<WorkflowVersionReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.WorkflowVersionsTable).where(eq(Tables.WorkflowVersionsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.WorkflowVersionsTable).where(eq(Tables.WorkflowVersionsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default WorkflowVersionsRepository;
