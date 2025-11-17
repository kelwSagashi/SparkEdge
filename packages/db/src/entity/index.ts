import 'dotenv/config';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schemas';

export const Tables = schema;

const sqlite = new Database(process.env.DB_FILE_NAME!);
export const db = drizzle(sqlite, { schema });

export type DBType = BetterSQLite3Database<typeof schema> & {
    $client: Database.Database;
};

export * from './schemas';