import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ServerResourceUpsertValues, ServerResourceReturningValues, ReturningQueries } from '../types';

export class ServerResourcesRepository {
  constructor(private db: DBType) {}

  create(values: ServerResourceUpsertValues): ReturningQueries<ServerResourceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerResourcesTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ServerResourceUpsertValues): ReturningQueries<ServerResourceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerResourcesTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ServerResourcesTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByServer(server_id: string): ReturningQueries<ServerResourceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ServerResourcesTable).where(eq(Tables.ServerResourcesTable.server_id, server_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  findById(id: string): ReturningQueries<ServerResourceReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ServerResourcesTable).where(eq(Tables.ServerResourcesTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ServerResourcesTable).where(eq(Tables.ServerResourcesTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ServerResourcesRepository;





