import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, lte, and, getTableColumns } from 'drizzle-orm';
// ensure lte import is referenced to avoid unused-import diagnostics in some toolchains
void lte;
import type { WorkflowExecutionUpsertValues, WorkflowExecutionReturningValues, ReturningQueries } from '../types';

export class WorkflowExecutionsRepository {
  constructor(private db: DBType) {}

  create(values: WorkflowExecutionUpsertValues): ReturningQueries<WorkflowExecutionReturningValues | null> {
    try {
      const data = this.db.insert(Tables.WorkflowExecutionsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: WorkflowExecutionUpsertValues): ReturningQueries<WorkflowExecutionReturningValues | null> {
    try {
      const data = this.db.insert(Tables.WorkflowExecutionsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.WorkflowExecutionsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<WorkflowExecutionReturningValues | null> {
    try {
      const data = this.db.select()
        .from(Tables.WorkflowExecutionsTable)
        .where(eq(Tables.WorkflowExecutionsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<(WorkflowExecutionReturningValues & { workflow: string | null })[]> {
    try {
      const data = this.db.select({
            ...getTableColumns(Tables.WorkflowExecutionsTable),
            workflow: Tables.WorkflowTable.name
        }).from(Tables.WorkflowExecutionsTable)
        .leftJoin(
            Tables.WorkflowTable, 
            eq(Tables.WorkflowExecutionsTable.workflow_id, Tables.WorkflowTable.id)
        ).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listByWorkflow(workflow_id: string): ReturningQueries<WorkflowExecutionReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.WorkflowExecutionsTable).where(eq(Tables.WorkflowExecutionsTable.workflow_id, workflow_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  /**
   * Update execution metadata such as status and timestamps.
   * Accepts any of: status, started_at, stopped_at, wait_till, deleted_at, enabled
   */
  updateStatus(id: string, updates: Partial<Record<'status'|'started_at'|'stopped_at'|'wait_till'|'deleted_at'|'enabled', string|number>>): ReturningQueries<WorkflowExecutionReturningValues | null> {
    try {
      const set: any = { ...updates };

      const data = this.db.update(Tables.WorkflowExecutionsTable).set(set).where(eq(Tables.WorkflowExecutionsTable.id, id)).returning().get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  setEnabled(id: string, enabled: boolean): ReturningQueries<WorkflowExecutionReturningValues | null> {
    try {
      const data = this.db.update(Tables.WorkflowExecutionsTable).set({ enabled }).where(eq(Tables.WorkflowExecutionsTable.id, id)).returning().get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  /**
   * List executions due up to a given ISO timestamp based on `wait_till` field.
   */
  listDueExecutions(untilIso: string): ReturningQueries<WorkflowExecutionReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.WorkflowExecutionsTable)
        .where(and(
          eq(Tables.WorkflowExecutionsTable.enabled, true),
          lte(Tables.WorkflowExecutionsTable.wait_till, untilIso),
          eq(Tables.WorkflowExecutionsTable.status, 'idle')
        ))
        .all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.WorkflowExecutionsTable).where(eq(Tables.WorkflowExecutionsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default WorkflowExecutionsRepository;
