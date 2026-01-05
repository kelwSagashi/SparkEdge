import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { UserUpsertValues, UserReturningValues, ReturningQueries } from '../types';

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
}

export default UsersRepository;
