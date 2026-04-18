import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { AuthorizationsTypeUpsertValues, AuthorizationsTypeReturningValues, ReturningQueries } from '../types';

export class AuthorizationsTypeRepository {
  constructor(private db: DBType) {}

  create(values: AuthorizationsTypeUpsertValues): ReturningQueries<AuthorizationsTypeReturningValues | null> {
    try {
      const data = this.db.insert(Tables.AuthorizationsTypeTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: AuthorizationsTypeUpsertValues): ReturningQueries<AuthorizationsTypeReturningValues | null> {
    try {
      const data = this.db.insert(Tables.AuthorizationsTypeTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.AuthorizationsTypeTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<AuthorizationsTypeReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.AuthorizationsTypeTable).where(eq(Tables.AuthorizationsTypeTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<AuthorizationsTypeReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.AuthorizationsTypeTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.AuthorizationsTypeTable).where(eq(Tables.AuthorizationsTypeTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default AuthorizationsTypeRepository;




