import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { DownloadedScriptUpsertValues, DownloadedScriptReturningValues, ReturningQueries } from '../types';

export class DownloadedScriptsRepository {
  constructor(private db: DBType) {}

  create(values: DownloadedScriptUpsertValues): ReturningQueries<DownloadedScriptReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DownloadedScriptsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: DownloadedScriptUpsertValues): ReturningQueries<DownloadedScriptReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DownloadedScriptsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.DownloadedScriptsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<DownloadedScriptReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.DownloadedScriptsTable).where(eq(Tables.DownloadedScriptsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<DownloadedScriptReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.DownloadedScriptsTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  markVenvReady(id: string, venv_path: string): ReturningQueries<DownloadedScriptReturningValues | null> {
    try {
      const data = this.db.update(Tables.DownloadedScriptsTable)
        .set({ venv_ready: true, venv_path, updated_at: new Date().toISOString() })
        .where(eq(Tables.DownloadedScriptsTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  update(id: string, values: Partial<DownloadedScriptUpsertValues>): ReturningQueries<DownloadedScriptReturningValues | null> {
    try {
      const data = this.db.update(Tables.DownloadedScriptsTable)
        .set({ ...values, updated_at: new Date().toISOString() })
        .where(eq(Tables.DownloadedScriptsTable.id, id))
        .returning()
        .get();
      return { data: data ?? null };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.DownloadedScriptsTable).where(eq(Tables.DownloadedScriptsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default DownloadedScriptsRepository;





