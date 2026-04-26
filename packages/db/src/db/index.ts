// import 'dotenv/config';
import path from "node:path";
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schemas';

export const Tables = schema;

const rawDbPath = process.env.DB_FILE_NAME || path.resolve(__dirname, "../../monitor.db");
const dbPath = rawDbPath.startsWith('file:') ? rawDbPath.replace('file:', '') : rawDbPath;

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });

export type DBType = BetterSQLite3Database<typeof schema> & {
    $client: Database.Database;
};

export * from './schemas';




