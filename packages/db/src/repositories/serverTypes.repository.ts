import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ServerTypeUpsertValues, ServerTypeReturningValues, ReturningQueries } from '../types';

export class ServerTypesRepository {
  constructor(private db: DBType) {}

  create(values: ServerTypeUpsertValues): ReturningQueries<ServerTypeReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerTypesTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ServerTypeUpsertValues): ReturningQueries<ServerTypeReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerTypesTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ServerTypesTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<ServerTypeReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ServerTypesTable).where(eq(Tables.ServerTypesTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<ServerTypeReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ServerTypesTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ServerTypesTable).where(eq(Tables.ServerTypesTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ServerTypesRepository;





