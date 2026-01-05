import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ServerEndpointsUpsertValues, ServerEndpointsReturningValues, ReturningQueries } from '../types';

export class ServerEndpointsRepository {
  constructor(private db: DBType) {}

  create(values: ServerEndpointsUpsertValues): ReturningQueries<ServerEndpointsReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerEndpointsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ServerEndpointsUpsertValues): ReturningQueries<ServerEndpointsReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServerEndpointsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ServerEndpointsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByServer(server_id: string): ReturningQueries<ServerEndpointsReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ServerEndpointsTable).where(eq(Tables.ServerEndpointsTable.server_id, server_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  findById(id: string): ReturningQueries<ServerEndpointsReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ServerEndpointsTable).where(eq(Tables.ServerEndpointsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ServerEndpointsTable).where(eq(Tables.ServerEndpointsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ServerEndpointsRepository;
