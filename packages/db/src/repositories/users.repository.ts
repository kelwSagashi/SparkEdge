import type { DBType } from "../db";
import { Tables } from "../db";
import { and, eq } from 'drizzle-orm';
import type { UserUpsertValues, UserReturningValues, ReturningQueries, ProjectReturningValues } from '../types';
import { nanoid } from "nanoid";

export class UsersRepository {
  constructor(private db: DBType) {}

  create(values: UserUpsertValues): ReturningQueries<UserReturningValues | null> {
    try {
      const data = this.db.insert(Tables.UsersTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: UserUpsertValues): ReturningQueries<UserReturningValues | null> {
    try {
      const data = this.db.insert(Tables.UsersTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.UsersTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<UserReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.UsersTable).where(eq(Tables.UsersTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
  
  findProjectUserByName(
    id: string, project: string
  ): ReturningQueries<
    {
      user: UserReturningValues, 
      project: ProjectReturningValues
    } | null
  > {
    try {
      const data = this.db.select({
          user: Tables.UsersTable,
          project: Tables.ProjectsTable
        }).from(Tables.UsersTable)
        .where(eq(Tables.UsersTable.id, id))
        .innerJoin(Tables.ProjectsTable, 
          and(
            eq(Tables.ProjectsTable.owner_id, Tables.UsersTable.id),
            eq(Tables.ProjectsTable.name, project)
          )
        ).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findByEmail(email: string): ReturningQueries<UserReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.UsersTable).where(eq(Tables.UsersTable.email, email)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<UserReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.UsersTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.UsersTable).where(eq(Tables.UsersTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  createApiKey(id: string): ReturningQueries<{ userId: string; apiKey: string } | null> {
    try {
      const data = this.db.update(Tables.UsersTable).set({ api_key: nanoid() }).where(eq(Tables.UsersTable.id, id)).returning().get();
      return {
        data: {
          userId: data.id,
          apiKey: data.api_key ?? ''
        }
      };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findByApiKey(apiKey: string): ReturningQueries<UserReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.UsersTable).where(eq(Tables.UsersTable.api_key, apiKey)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default UsersRepository;





