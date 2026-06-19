/// <reference types="bun-types" />
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";
import * as schema from "./schemas";

export const Tables = schema;

function resolveDatabasePath(): string {
  const envValue = process.env.DB_FILE_NAME;
  if (envValue) {
    if (path.isAbsolute(envValue)) {
      return envValue;
    }
    if (process.env.SPARK_EDGE_DATA_DIR) {
      if (process.env.SPARK_EDGE_DATA_DIR !== process.cwd()) {
        return path.join(process.env.SPARK_EDGE_DATA_DIR, "monitor.db");
      }
      return path.resolve(process.env.SPARK_EDGE_DATA_DIR, envValue);
    }
    return path.resolve(process.cwd(), envValue);
  }

  if (process.env.SPARK_EDGE_DATA_DIR) {
    return path.join(process.env.SPARK_EDGE_DATA_DIR, "monitor.db");
  }

  const devDbPath = path.resolve(process.cwd(), "packages/db/monitor.db");
  if (fs.existsSync(path.dirname(devDbPath))) {
    return devDbPath;
  }

  return path.join(os.homedir(), ".spark-edge", "monitor.db");
}

function ensureDatabaseDirectory(dbPath: string): void {
  if (dbPath === ":memory:") return;

  const resolved = dbPath.startsWith("file:")
    ? path.resolve(process.cwd(), dbPath.slice("file:".length))
    : path.resolve(dbPath);

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
}

const dbPath = resolveDatabasePath();
ensureDatabaseDirectory(dbPath);

const sqlite = new Database(dbPath);
sqlite.exec("PRAGMA foreign_keys = ON;");
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
    if (process.env.SPARK_EDGE_MIGRATIONS_DIR && fs.existsSync(process.env.SPARK_EDGE_MIGRATIONS_DIR)) {
      drizleDir = process.env.SPARK_EDGE_MIGRATIONS_DIR;
    } else if (fs.existsSync(repoDrizlePath)) {
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

console.log("sqlite.name", sqlite.filename);
export type DBType = BunSQLiteDatabase<typeof schema> & {
  $client: Database;
};

export * from "./schemas";
