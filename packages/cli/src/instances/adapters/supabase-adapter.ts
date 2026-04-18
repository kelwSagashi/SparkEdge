import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { SupabaseDriver } from "../drivers/supabase.driver";
import { SupabaseServerType } from "../server-types";

@CredentialAdapter()
export class SupabaseAdapter extends BaseAdapter {
    static readonly metadata: AdapterMetadata = {
        name: "Supabase",
        strategy: "supabase",
        id: "supabase",
        server_type_id: SupabaseServerType,
        fields: [
            { key: 'url', label: 'Supabase URL', type: 'text', placeholder: 'https://xyz.supabase.co' },
            { key: 'apiKey', label: 'API Key (Service Role ou Anon)', type: 'password' }
        ],
        resourceFields: [
            { key: 'table', label: 'Table Name', type: 'text', placeholder: 'sensors_data' }
        ],
        operationFields: [
            { key: 'method', label: 'Method', type: 'select', options: [
                { label: 'Insert', value: 'insert' },
                { label: 'Update', value: 'update' },
                { label: 'Upsert', value: 'upsert' },
                { label: 'Select', value: 'select' }
            ]}
        ]
    };

    private driver: SupabaseDriver;

    constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
        super(...args);
        const { url, apiKey } = this.credentialData;
        this.driver = new SupabaseDriver({ url, apiKey });
    }

    async send(payload: any) {
        await this.driver.connect();
        try {
            const resourceConfig = this.resource.config as any;
            const table = resourceConfig?.table || '';
            
            const operationConfig = this.operation.config as any;
            const op = operationConfig?.method || 'insert';
            
            let method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'POST';
            let headers: any = { ...this.headers };
            let body = payload;
            let queryParams: any = undefined;

            if (op === 'insert') {
                method = 'POST';
            } else if (op === 'update') {
                method = 'PATCH';
            } else if (op === 'upsert') {
                method = 'POST';
                headers['Prefer'] = 'resolution=merge-duplicates';
            } else if (op === 'select') {
                method = 'GET';
                body = undefined;
                // Map payload keys to 'eq.' match filters for simple select
                if (payload && typeof payload === 'object') {
                    queryParams = {};
                    for (const [key, value] of Object.entries(payload)) {
                        queryParams[key] = `eq.${value}`;
                    }
                }
            }

            return await this.driver.request({
                table,
                method,
                body,
                params: queryParams,
                headers
            });
        } finally {
            await this.driver.disconnect();
        }
    }

    async test() {
        await this.driver.connect();
        return await this.driver.getSchema().catch(err => {
            if (err.message.includes('404')) return;
            throw err;
        });
    }

    async discover() {
        await this.driver.connect();
        try {
            const schema = await this.driver.getSchema();
            const results = [];
            
            // PostgREST OpenAPI spec has tables in 'definitions'
            const definitions = schema.definitions || {};
            
            for (const [tableName, definition] of Object.entries<any>(definitions)) {
                const columns = definition.properties || {};
                results.push({
                    name: tableName,
                    type: 'table',
                    config: {
                        table: tableName
                    },
                    columns: Object.entries<any>(columns).map(([colName, colDef]) => ({
                        name: colName,
                        type: colDef.type || 'string',
                        description: colDef.description,
                        nullable: true // Spec doesn't always show this clearly
                    }))
                });
            }
            
            return results;
        } finally {
            await this.driver.disconnect();
        }
    }
}
