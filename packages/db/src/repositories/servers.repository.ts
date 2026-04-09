import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ServerUpsertValues, ServerReturningValues, ReturningQueries } from '../types';

export class ServersRepository {
  constructor(private db: DBType) {}

  create(values: ServerUpsertValues): ReturningQueries<ServerReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServersTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ServerUpsertValues): ReturningQueries<ServerReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ServersTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ServersTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<ServerReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ServersTable).where(eq(Tables.ServersTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<ServerReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ServersTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listAllWithDetails() {
    try {
      const data = this.db.select().from(Tables.ServersTable)
        .leftJoin(Tables.ServerEndpointsTable, eq(Tables.ServersTable.id, Tables.ServerEndpointsTable.server_id))
        .all();
      return { data };
    } catch (e: unknown){

    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ServersTable).where(eq(Tables.ServersTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ServersRepository;
