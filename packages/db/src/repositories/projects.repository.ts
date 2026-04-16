import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ProjectUpsertValues, ProjectReturningValues, ReturningQueries } from '../types';

export class ProjectsRepository {
  constructor(private db: DBType) {}

  create(values: ProjectUpsertValues): ReturningQueries<ProjectReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ProjectsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ProjectUpsertValues): ReturningQueries<ProjectReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ProjectsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ProjectsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<ProjectReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ProjectsTable).where(eq(Tables.ProjectsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findByKey(key: string): ReturningQueries<ProjectReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ProjectsTable).where(eq(Tables.ProjectsTable.key, key)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<ProjectReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ProjectsTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  findByOwner(ownerId: string): ReturningQueries<ProjectReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ProjectsTable)
        .where(eq(Tables.ProjectsTable.owner_id, ownerId)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  update(id: string, values: Partial<ProjectUpsertValues>): ReturningQueries<ProjectReturningValues | null> {
    try {
      const data = this.db.update(Tables.ProjectsTable)
        .set({ ...values, updated_at: new Date().toISOString() })
        .where(eq(Tables.ProjectsTable.id, id))
        .returning().get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ProjectsTable).where(eq(Tables.ProjectsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ProjectsRepository;
