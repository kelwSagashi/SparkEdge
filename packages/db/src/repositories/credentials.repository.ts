import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { CredentialUpsertValues, CredentialReturningValues, ReturningQueries } from '../types';

export class CredentialsRepository {
  constructor(private db: DBType) {}

  create(values: CredentialUpsertValues): ReturningQueries<CredentialReturningValues | null> {
    try {
      const data = this.db.insert(Tables.CredentialsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: CredentialUpsertValues): ReturningQueries<CredentialReturningValues | null> {
    try {
      const data = this.db.insert(Tables.CredentialsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.CredentialsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<CredentialReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.CredentialsTable).where(eq(Tables.CredentialsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<CredentialReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.CredentialsTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.CredentialsTable).where(eq(Tables.CredentialsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default CredentialsRepository;





