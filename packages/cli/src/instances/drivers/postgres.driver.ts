import { Driver } from './driver.interface';
import pg from 'pg';

export interface PostgresDriverConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | any;
}

export class PostgresDriver implements Driver {
  private pool: pg.Pool;

  constructor(private config: PostgresDriverConfig) {
    this.pool = new pg.Pool({
      connectionString: config.connectionString,
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
    });
  }

  async connect(): Promise<void> {
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async getTables(): Promise<{ name: string, schema: string }[]> {
    const sql = `
      SELECT table_name as name, table_schema as schema
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
      AND table_type = 'BASE TABLE'
    `;
    return this.query<{ name: string, schema: string }>(sql);
  }

  async getColumns(tableName: string, schemaName: string = 'public'): Promise<any[]> {
    const sql = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = $2
      ORDER BY ordinal_position
    `;
    return this.query(sql, [tableName, schemaName]);
  }
}
