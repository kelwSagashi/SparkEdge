import { db, Tables, type DBType } from "../db";
import type { 
    CodeInstanceReturningValues, 
    DeviceReturningValues, 
    DeviceUpsertValues, 
    ServerEndpointsReturningValues, 
    ServerEndpointsUpsertValues, 
    ServerReturningValues, 
    ServerUpsertValues, 
    WorkflowReturningValues, 
    WorkflowUpsertValues,
    CredentialUpsertValues,
    CredentialReturningValues
    } from '../types';
import { UsersRepository } from '../repositories/users.repository';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectMembersRepository } from '../repositories/projectMembers.repository';
import { WorkflowVersionsRepository } from '../repositories/workflowVersions.repository';
import { ServersRepository } from '../repositories/servers.repository';
import { ServerTypesRepository } from '../repositories/serverTypes.repository';
import { ServerEndpointsRepository } from '../repositories/serverEndpoints.repository';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { DevicesRepository } from '../repositories/devices.repository';
import { CodeInstancesRepository } from '../repositories/codeInstances.repository';
import { WorkflowsRepository } from '../repositories/workflows.repository';
import { WorkflowExecutionsRepository } from '../repositories/workflowExecutions.repository';
import { eq } from 'drizzle-orm';
 

type ReturningQueries<T> = {
    error?: unknown,
    data: T
};

export class DatabaseService {
    private static instance: DatabaseService;
    private db: DBType | undefined;
    private usersRepo?: UsersRepository;
    private projectsRepo?: ProjectsRepository;
    private projectMembersRepo?: ProjectMembersRepository;
    private workflowVersionsRepo?: WorkflowVersionsRepository;
    private serversRepo?: ServersRepository;
    private serverTypesRepo?: ServerTypesRepository;
    private serverEndpointsRepo?: ServerEndpointsRepository;
    private credentialsRepo?: CredentialsRepository;
    private devicesRepo?: DevicesRepository;
    private codeInstancesRepo?: CodeInstancesRepository;
    private workflowsRepo?: WorkflowsRepository;
    private workflowExecutionsRepo?: WorkflowExecutionsRepository;

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

    public get users() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.usersRepo) this.usersRepo = new UsersRepository(this.db);
        return this.usersRepo;
    }

    public get projects() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.projectsRepo) this.projectsRepo = new ProjectsRepository(this.db);
        return this.projectsRepo;
    }

    public get projectMembers() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.projectMembersRepo) this.projectMembersRepo = new ProjectMembersRepository(this.db);
        return this.projectMembersRepo;
    }

    public get workflowVersions() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.workflowVersionsRepo) this.workflowVersionsRepo = new WorkflowVersionsRepository(this.db);
        return this.workflowVersionsRepo;
    }

    public get servers() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.serversRepo) this.serversRepo = new ServersRepository(this.db);
        return this.serversRepo;
    }

    public get serverTypes() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.serverTypesRepo) this.serverTypesRepo = new ServerTypesRepository(this.db);
        return this.serverTypesRepo;
    }

    public get serverEndpoints() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.serverEndpointsRepo) this.serverEndpointsRepo = new ServerEndpointsRepository(this.db);
        return this.serverEndpointsRepo;
    }

    public get credentials() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.credentialsRepo) this.credentialsRepo = new CredentialsRepository(this.db);
        return this.credentialsRepo;
    }

    public get devices() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.devicesRepo) this.devicesRepo = new DevicesRepository(this.db);
        return this.devicesRepo;
    }

    public get codeInstances() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.codeInstancesRepo) this.codeInstancesRepo = new CodeInstancesRepository(this.db);
        return this.codeInstancesRepo;
    }

    public get workflows() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.workflowsRepo) this.workflowsRepo = new WorkflowsRepository(this.db);
        return this.workflowsRepo;
    }

    public get workflowExecutions() {
        if (!this.db) throw Error('The database has not been instantiated.');
        if (!this.workflowExecutionsRepo) this.workflowExecutionsRepo = new WorkflowExecutionsRepository(this.db);
        return this.workflowExecutionsRepo;
    }

    upsertWorkflow(values: WorkflowUpsertValues): ReturningQueries<WorkflowReturningValues | null> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.insert(Tables.WorkflowTable)
                    .values(values)
                    .onConflictDoUpdate({
                        target: Tables.WorkflowTable.id,
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

    /**
     * Register a full server configuration in a single transaction.
     * - Optionally create credentials
     * - Upsert server (with credential_id if created)
     * - Upsert endpoints (attached to server id)
     */
    registerServer(
        params: { 
            server: ServerUpsertValues; 
            authorization: CredentialUpsertValues; 
            endpoints: ServerEndpointsUpsertValues[]
        } & { 
            created_by?: string | undefined, 
            project_id?: string | undefined
        }
    ): ReturningQueries<{ 
        server: ServerReturningValues; 
        credential: CredentialReturningValues; 
        endpoints: ServerEndpointsReturningValues[] 
    } | null> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");

            const tx = this.db.$client.transaction(() => {
                

                const credValues: CredentialUpsertValues = {
                    name: params.authorization.name ?? `${params.server.name} Credential`,
                    type: params.authorization.type,
                    data: params.authorization.data ?? {},
                    owner_id: params.server.created_by ?? params.created_by ?? null,
                    project_id: params.server.project_id ?? params.project_id ?? null,
                };

                const credRes = this.credentials.upsert(credValues);
                if (credRes.error || !credRes.data) throw credRes.error;
                const createdCredential = credRes.data;
                params.server.credential_id = createdCredential.id;
                

                // Ensure created_by/project_id are set on server
                if (params.created_by && !params.server.created_by) params.server.created_by = params.created_by;
                if (params.project_id && !params.server.project_id) params.server.project_id = params.project_id;

                const serverRes = this.upsertServer(params.server);
                if (serverRes.error || !serverRes.data) throw serverRes.error ?? new Error('Failed to upsert server');
                const server = serverRes.data;

                const createdEndpoints: ServerEndpointsReturningValues[] = [];
                for (const ep of params.endpoints ?? []) {
                    const epVals: ServerEndpointsUpsertValues = { ...ep, server_id: server.id };
                    const epRes = this.upsertServerEndpoint(epVals);
                    if (epRes.error || !epRes.data) throw epRes.error ?? new Error('Failed to upsert server endpoint');
                    createdEndpoints.push(epRes.data);
                }

                return { server, credential: createdCredential, endpoints: createdEndpoints };
            });

            const result = tx();
            return { data: result };
        } catch (error: unknown) {
            return { error, data: null };
        }
    }

    listAllCodeInstances(): ReturningQueries<CodeInstanceReturningValues[]> {
        try {
            if (!this.db) throw Error("The database has not been instantiated.");
            return {
                data: this.db.select()
                    .from(Tables.CodeInstanceTable)
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
                        others: []
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