import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from "./schemas";

export const Tables = schema;

function resolveDatabasePath(): string {
  const envValue = process.env.DB_FILE_NAME;
  const repoDbPath = path.resolve(process.cwd(), "packages/db/monitor.db");
  const binaryDbPath = path.resolve(
    path.dirname(process.execPath),
    "monitor.db",
  );
  const defaultPath = fs.existsSync(path.dirname(repoDbPath))
    ? repoDbPath
    : binaryDbPath;

  if (!envValue) {
    return defaultPath;
  }

  return envValue;
}

function ensureDatabaseDirectory(dbPath: string): void {
  if (dbPath === ":memory:") return;

  const resolved = dbPath.startsWith("file:")
    ? path.resolve(process.cwd(), dbPath.slice("file:".length))
    : path.resolve(process.cwd(), dbPath);

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
}

const dbPath = resolveDatabasePath();
ensureDatabaseDirectory(dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite, { schema });

function runMigrations(): void {
  try {
    // Find the migrations directory: could be ./drizzle relative to cwd,
    // or embedded in the binary distribution
    const repoDrizlePath = path.resolve(process.cwd(), "drizzle");
    const binDrizlePath = path.resolve(__dirname, "..", "..", "drizzle");
    const altBinDrizlePath = path.resolve(
      path.dirname(process.execPath),
      "drizzle",
    );

    let drizleDir: string | undefined;
    if (fs.existsSync(repoDrizlePath)) {
      drizleDir = repoDrizlePath;
    } else if (fs.existsSync(binDrizlePath)) {
      drizleDir = binDrizlePath;
    } else if (fs.existsSync(altBinDrizlePath)) {
      drizleDir = altBinDrizlePath;
    }

    if (!drizleDir) {
      console.warn(
        "[Database] Migrations directory not found. Database may not be properly initialized.",
      );
      return;
    }

    console.log("[Database] Running migrations from:", drizleDir);
    migrate(db, { migrationsFolder: drizleDir });
    console.log("[Database] Migrations completed successfully");
  } catch (error) {
    console.error(
      "[Database] Migration failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

runMigrations();

console.log("DB_FILE_NAME", process.env.DB_FILE_NAME);

console.log("sqlite.name", sqlite.name);
export type DBType = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

export * from "./schemas";
