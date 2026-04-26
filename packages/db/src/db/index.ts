import 'dotenv/config';
import path from "node:path";
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schemas';

export const Tables = schema;

const dbPath = process.env.DB_FILE_NAME 
  ?? path.resolve(process.cwd(), "packages/db/monitor.db");

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });

console.log("DB_FILE_NAME", process.env.DB_FILE_NAME);

console.log("sqlite.name", sqlite.name);
export type DBType = BetterSQLite3Database<typeof schema> & {
    $client: Database.Database;
};

export * from './schemas';




