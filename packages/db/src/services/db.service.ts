import { db, Tables, type DBType } from "../entity";
import type { 
    CodeInstanceReturningValues, 
    DeviceReturningValues, 
    DeviceUpsertValues, 
    ServerEndpointsReturningValues, 
    ServerEndpointsUpsertValues, 
    ServerReturningValues, 
    ServerUpsertValues, 
    WorkflowReturningValues, 
    WorkflowUpsertValues
    } from '../types';
import { eq } from "drizzle-orm";

type ReturningQueries<T> = {
    error?: unknown,
    data: T
};

export class DatabaseService {
    private static instance: DatabaseService;
    private db: DBType | undefined;

    private constructor(db: DBType | undefined) {
        this.db = db;
    }
    

    public static getInstance(db: DBType): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(db);
        }
        DatabaseService.instance.db = db;
        return DatabaseService.instance;
    }

    public getDb() { return this.db }

    upsertWorkflow(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.insert(Tables.Workflow)
                    .values(values)
                    .onConflictDoUpdate({
                        target: Tables.Workflow.id,
                        set: values
                    }).returning().get()
            }
        } catch (error: unknown) {
            return {
                error: error,
                data: null
            };
        }
    }

    upsertServer(values: ServerUpsertValues): ReturningQueries<ServerReturningValues | null> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.insert(Tables.ServersTable)
                    .values(values)
                    .onConflictDoUpdate({
                        target: Tables.ServersTable.id,
                        set: values
                    }).returning().get()
            }
        } catch (error: unknown) {
            return {
                error: error,
                data: null
            };
        }
    }

    upsertServerEndpoint(values: ServerEndpointsUpsertValues): ReturningQueries<ServerEndpointsReturningValues | null> {
        try {

            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.insert(Tables.ServerEndpointsTable)
                    .values(values)
                    .onConflictDoUpdate({
                        target: Tables.ServerEndpointsTable.id,
                        set: values
                    }).returning().get()
            }
        } catch (error: unknown) {
            return {
                error: error,
                data: null
            };
        }
    }

    upsertDevice(values: DeviceUpsertValues): ReturningQueries<DeviceReturningValues | null> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.insert(Tables.DeviceTable)
                    .values(values)
                    .onConflictDoUpdate({
                        target: Tables.DeviceTable.id,
                        set: values
                    }).returning().get()
            }
        } catch (error: unknown) {
            return {
                error: error,
                data: null
            };
        }
    }

    listAllDevices(): ReturningQueries<DeviceReturningValues[]> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.select().from(Tables.DeviceTable).all()
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }

    listAllServers(): ReturningQueries<ServerReturningValues[]> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.select().from(Tables.ServersTable).all()
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }

    listAllServerEndpoints(server_id: string): ReturningQueries<ServerEndpointsReturningValues[]> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.select()
                    .from(Tables.ServerEndpointsTable)
                    .where(eq(Tables.ServerEndpointsTable.server_id, server_id))
                    .all()
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }

    listAllCodeInstances(): ReturningQueries<CodeInstanceReturningValues[]> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.select()
                    .from(Tables.CodeInstance)
                    .all()
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }
    
    listMockDevices(): ReturningQueries<DeviceReturningValues[]> {
        try {
            return {
                data: [
                    {
                        brand: "intelbras",
                        connection_method: "serial",
                        created_at: new Date().toISOString(),
                        description: "",
                        device_id: "1",
                        id: "1",
                        ip_address: null,
                        location: "laber_1",
                        name: "controlador intelbras",
                        serial_number: "abc123",
                        updated_at: new Date().toISOString(),
                        others: {}
                    }
                ]
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }
    
    listSampleScripts(): ReturningQueries<CodeInstanceReturningValues[]> {
        try {
            return {
                data: [
                    {
                        author: "system",
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                        name: "sample class",
                        description: "",
                        id: "1",
                        language: "python",
                        main_file_name: "sample_class.py",
                        path: "/extensions/samples/",
                        source: "system_repo",
                        entry_fn: null,
                        repo: null,
                        url: null,
                        version: "1"
                    },
                    {
                        author: "system",
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                        name: "sample class with decorators",
                        description: "",
                        id: "2",
                        language: "python",
                        main_file_name: "sample_class_dec.py",
                        path: "/extensions/samples/",
                        source: "system_repo",
                        entry_fn: null,
                        repo: null,
                        url: null,
                        version: "1"
                    },
                    {
                        author: "system",
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                        name: "sample imp",
                        description: "",
                        id: "3",
                        language: "python",
                        main_file_name: "sample_imp.py",
                        path: "/extensions/samples/",
                        source: "system_repo",
                        entry_fn: null,
                        repo: null,
                        url: null,
                        version: "1"
                    },
                    {
                        author: "system",
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                        name: "sample imp with decorators",
                        description: "",
                        id: "4",
                        language: "python",
                        main_file_name: "sample_imp_dec.py",
                        path: "/extensions/samples",
                        source: "system_repo",
                        entry_fn: null,
                        repo: null,
                        url: null,
                        version: "1"
                    },
                ]
            }
        } catch (error: unknown) {
            return {
                error,
                data: []
            }
        }
    }


}
export const dbManager = DatabaseService.getInstance(db);