import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { PostgresDriver } from "../drivers/postgres.driver";
import { PostgresServerType } from "../server-types";

@CredentialAdapter()
export class PostgresAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "PostgreSQL",
    strategy: "postgres",
    id: "postgres",
    server_type_id: PostgresServerType,
    fields: [
      { key: 'host', label: 'Host', type: 'text', placeholder: 'db.postgres.com' },
      { key: 'port', label: 'Porta', type: 'text', placeholder: '5432', grid: 'col-span-1' },
      { key: 'database', label: 'Banco de Dados', type: 'text', placeholder: 'postgres', grid: 'col-span-1' },
      { key: 'user', label: 'Usuário', type: 'text', grid: 'col-span-1' },
      { key: 'password', label: 'Senha', type: 'password', grid: 'col-span-1' }
    ],
    resourceFields: [
      { key: 'table', label: 'Tabela', type: 'text', placeholder: 'users' }
    ],
    operationFields: [
      { 
        key: 'operation', 
        label: 'Operação', 
        type: 'select', 
        options: [
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Select', value: 'select' }
        ]
      }
    ]
  };

  private driver: PostgresDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const { user, password, host, port, database } = this.credentialData;
    this.driver = new PostgresDriver({ user, password, host, port: Number(port), database });
  }

  async send(payload: any) {
    await this.driver.connect();
    try {
      const table = this.resource.config.table;
      const schema = this.resource.config.schema || 'public';
      const operationConfig = this.operation.config as any;
      const op = this.operation.type || operationConfig?.operation || 'insert';

      const keys = Object.keys(payload);
      const values = Object.values(payload);
      
      if (op === 'insert' || this.operation.type === 'postgres') {
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO "${schema}"."${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
        return await this.driver.query(sql, values);
      }
      
      if (op === 'update') {
        // Simple update by ID if present
        const id = payload.id;
        if (!id) throw new Error('Update operation requires an id field in payload');
        const updateKeys = keys.filter(k => k !== 'id');
        const setClause = updateKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const sql = `UPDATE "${schema}"."${table}" SET ${setClause} WHERE id = $${updateKeys.length + 1} RETURNING *`;
        return await this.driver.query(sql, [...updateKeys.map(k => payload[k]), id]);
      }

      if (op === 'select') {
        const sql = `SELECT * FROM "${schema}"."${table}" WHERE 1=1 ${keys.map((k, i) => ` AND "${k}" = $${i+1}`).join('')}`;
        return await this.driver.query(sql, values);
      }

      return null;
    } finally {
      await this.driver.disconnect();
    }
  }

  async test() {
    await this.driver.connect();
    const result = await this.driver.query('SELECT 1 as test');
    await this.driver.disconnect();
    return result;
  }

  async discover() {
    await this.driver.connect();
    try {
      const tables = await this.driver.getTables();
      const results = [];
      for (const table of tables) {
        const columns = await this.driver.getColumns(table.name, table.schema);
        results.push({
          name: `${table.schema}.${table.name}`,
          type: 'table',
          config: {
            table: table.name,
            schema: table.schema
          },
          columns: columns.map(c => ({
            name: c.column_name,
            type: c.data_type,
            nullable: c.is_nullable === 'YES'
          }))
        });
      }
      return results;
    } finally {
      await this.driver.disconnect();
    }
  }
}