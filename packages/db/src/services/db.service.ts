import { db, Tables, type DBType } from "../schema";
import type { 
    CodeInstanceReturningValues, 
    DeviceReturningValues, 
    DeviceUpsertValues, 
    ServerEndpointsReturningValues, 
    ServerEndpointsUpsertValues, 
    ServerReturningValues, 
    ServerUpsertValues 
    } from '../types';
import { eq } from "drizzle-orm";

type ReturningQueries<T> = {
    error?: unknown,
    data: T
};

export class DatabaseService {
    private static instance: DatabaseService;
    private db: DBType;

    private constructor(db: DBType) {
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

    upsertServer(values: ServerUpsertValues): ReturningQueries<ServerReturningValues | null> {
        try {
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
}
const DatabaseInstance = DatabaseService.getInstance(db);
export default DatabaseInstance;