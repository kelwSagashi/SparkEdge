import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { CodeInstanceUpsertValues, CodeInstanceReturningValues, ReturningQueries } from '../types';

export class CodeInstancesRepository {
  constructor(private db: DBType) {}

  create(values: CodeInstanceUpsertValues): ReturningQueries<CodeInstanceReturningValues | null >{
    try {
      const data = this.db.insert(Tables.CodeInstance).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: CodeInstanceUpsertValues): ReturningQueries<CodeInstanceReturningValues | null >{
    try { 
      const data = this.db.insert(Tables.CodeInstance)
        .values(values)
        .onConflictDoUpdate({ target: Tables.CodeInstance.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<CodeInstanceReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.CodeInstance).where(eq(Tables.CodeInstance.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<CodeInstanceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.CodeInstance).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.CodeInstance).where(eq(Tables.CodeInstance.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default CodeInstancesRepository;
