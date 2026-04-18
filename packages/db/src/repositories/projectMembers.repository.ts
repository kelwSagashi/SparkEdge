import type { DBType } from "../db";
import { Tables } from "../db";
import type { ProjectMemberUpsertValues, ProjectMemberReturningValues, ReturningQueries } from '../types';
import { eq } from 'drizzle-orm';

export class ProjectMembersRepository {
  constructor(private db: DBType) {}

  add(values: ProjectMemberUpsertValues): ReturningQueries<ProjectMemberReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ProjectMembersTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findByProject(project_id: string): ReturningQueries<ProjectMemberReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ProjectMembersTable).where(eq(Tables.ProjectMembersTable.project_id, project_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  upsert(values: ProjectMemberUpsertValues): ReturningQueries<ProjectMemberReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ProjectMembersTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ProjectMembersTable.id, set: values })
        .returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  remove(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ProjectMembersTable).where(eq(Tables.ProjectMembersTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ProjectMembersRepository;





