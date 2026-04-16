import { db, Tables, type DBType } from "../db";
import type {
  DeviceReturningValues,
  DeviceUpsertValues,
  ServerReturningValues,
  ServerUpsertValues,
  ServerResourceUpsertValues,
  ServerResourceReturningValues,
  ResourceOperationUpsertValues,
  ResourceOperationReturningValues,
  CredentialUpsertValues,
  CredentialReturningValues,
} from '../types';
import { UsersRepository } from '../repositories/users.repository';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectMembersRepository } from '../repositories/projectMembers.repository';
import { ServersRepository } from '../repositories/servers.repository';
import { ServerTypesRepository } from '../repositories/serverTypes.repository';
import { ServerResourcesRepository } from '../repositories/serverResources.repository';
import { ResourceOperationsRepository } from '../repositories/resourceOperations.repository';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { DevicesRepository } from '../repositories/devices.repository';
import { InstancesRepository } from '../repositories/instances.repository';
import { InstanceExecutionsRepository } from '../repositories/instanceExecutions.repository';
import { DownloadedScriptsRepository } from '../repositories/downloadedScripts.repository';
import { LocalFallbackStorageRepository } from '../repositories/localFallbackStorage.repository';
import { TagsRepository } from '../repositories/tags.repository';
import { InstanceTagsRepository } from '../repositories/instanceTags.repository';
import { InstanceDestinationsRepository } from '../repositories/instanceDestinations.repository';
import { DataMappingsRepository } from '../repositories/dataMappings.repository';
import { AuthorizationsTypeRepository } from "../repositories/authorizationTypes.repository";
import type { InstanceUpsertValues, InstanceDestinationUpsertValues, DataMappingUpsertValues, InstanceReturningValues, InstanceDestinationReturningValues, DataMappingReturningValues } from '../types';
import { eq, inArray, notInArray, and } from 'drizzle-orm';


type ReturningQueries<T> = {
  error?: unknown,
  data: T
};

export class DatabaseService {
  private static instance: DatabaseService;
  private db: DBType | undefined;

  // Core
  private usersRepo?: UsersRepository;
  private projectsRepo?: ProjectsRepository;
  private projectMembersRepo?: ProjectMembersRepository;

  // Infrastructure
  private serversRepo?: ServersRepository;
  private serverTypesRepo?: ServerTypesRepository;
  private serverResourcesRepo?: ServerResourcesRepository;
  private resourceOperationsRepo?: ResourceOperationsRepository;
  private credentialsRepo?: CredentialsRepository;
  private authorizationTypesRepo?: AuthorizationsTypeRepository;
  private devicesRepo?: DevicesRepository;

  // Instances
  private instancesRepo?: InstancesRepository;
  private instanceExecutionsRepo?: InstanceExecutionsRepository;
  private instanceDestinationsRepo?: InstanceDestinationsRepository;
  private dataMappingsRepo?: DataMappingsRepository;

  // Scripts
  private downloadedScriptsRepo?: DownloadedScriptsRepository;

  // Fallback
  private localFallbackRepo?: LocalFallbackStorageRepository;

  // Tags
  private tagsRepo?: TagsRepository;
  private instanceTagsRepo?: InstanceTagsRepository;

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

  public getDb() { return this.db; }

  // ─── Core Repos ──────────────────────────────────────────────────────────────

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

  // ─── Infrastructure Repos ─────────────────────────────────────────────────────

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

  public get serverResources() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.serverResourcesRepo) this.serverResourcesRepo = new ServerResourcesRepository(this.db);
    return this.serverResourcesRepo;
  }

  public get resourceOperations() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.resourceOperationsRepo) this.resourceOperationsRepo = new ResourceOperationsRepository(this.db);
    return this.resourceOperationsRepo;
  }

  public get credentials() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.credentialsRepo) this.credentialsRepo = new CredentialsRepository(this.db);
    return this.credentialsRepo;
  }

  public get authorizationTypes() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.authorizationTypesRepo) this.authorizationTypesRepo = new AuthorizationsTypeRepository(this.db);
    return this.authorizationTypesRepo;
  }

  public get devices() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.devicesRepo) this.devicesRepo = new DevicesRepository(this.db);
    return this.devicesRepo;
  }

  // ─── Instance Repos ───────────────────────────────────────────────────────────

  public get instances() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.instancesRepo) this.instancesRepo = new InstancesRepository(this.db);
    return this.instancesRepo;
  }

  public get instanceExecutions() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.instanceExecutionsRepo) this.instanceExecutionsRepo = new InstanceExecutionsRepository(this.db);
    return this.instanceExecutionsRepo;
  }

  public get instanceDestinations() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.instanceDestinationsRepo) this.instanceDestinationsRepo = new InstanceDestinationsRepository(this.db);
    return this.instanceDestinationsRepo;
  }

  public get dataMappings() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.dataMappingsRepo) this.dataMappingsRepo = new DataMappingsRepository(this.db);
    return this.dataMappingsRepo;
  }

  // ─── Script Repos ─────────────────────────────────────────────────────────────

  public get downloadedScripts() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.downloadedScriptsRepo) this.downloadedScriptsRepo = new DownloadedScriptsRepository(this.db);
    return this.downloadedScriptsRepo;
  }

  // ─── Fallback Repos ───────────────────────────────────────────────────────────

  public get localFallback() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.localFallbackRepo) this.localFallbackRepo = new LocalFallbackStorageRepository(this.db);
    return this.localFallbackRepo;
  }

  // ─── Tags Repos ─────────────────────────────────────────────────────────────

  public get tags() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.tagsRepo) this.tagsRepo = new TagsRepository(this.db);
    return this.tagsRepo;
  }

  public get instanceTags() {
    if (!this.db) throw Error('The database has not been instantiated.');
    if (!this.instanceTagsRepo) this.instanceTagsRepo = new InstanceTagsRepository(this.db);
    return this.instanceTagsRepo;
  }

  // ─── Composite Operations ─────────────────────────────────────────────────────

  upsertServer(values: ServerUpsertValues): ReturningQueries<ServerReturningValues | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return {
        data: this.db.insert(Tables.ServersTable)
          .values(values)
          .onConflictDoUpdate({ target: Tables.ServersTable.id, set: values })
          .returning().get()
      };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertServerResource(values: ServerResourceUpsertValues): ReturningQueries<ServerResourceReturningValues | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return {
        data: this.db.insert(Tables.ServerResourcesTable)
          .values(values)
          .onConflictDoUpdate({ target: Tables.ServerResourcesTable.id, set: values })
          .returning().get()
      };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertResourceOperation(values: ResourceOperationUpsertValues): ReturningQueries<ResourceOperationReturningValues | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return {
        data: this.db.insert(Tables.ResourceOperationsTable)
          .values(values)
          .onConflictDoUpdate({ target: Tables.ResourceOperationsTable.id, set: values })
          .returning().get()
      };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsertDevice(values: DeviceUpsertValues): ReturningQueries<DeviceReturningValues | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return {
        data: this.db.insert(Tables.DeviceTable)
          .values(values)
          .onConflictDoUpdate({ target: Tables.DeviceTable.id, set: values })
          .returning().get()
      };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAllDevices(): ReturningQueries<DeviceReturningValues[]> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return { data: this.db.select().from(Tables.DeviceTable).all() };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listAllServers(): ReturningQueries<ServerReturningValues[]> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      return { data: this.db.select().from(Tables.ServersTable).all() };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  listAllServerResources(server_id: string): ReturningQueries<{
    resource: ServerResourceReturningValues;
    operations: ResourceOperationReturningValues[];
  }[]> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");
      
      const resources = this.db.select()
        .from(Tables.ServerResourcesTable)
        .where(eq(Tables.ServerResourcesTable.server_id, server_id))
        .all();

      const data = resources.map(resource => {
        const operations = this.db!.select()
          .from(Tables.ResourceOperationsTable)
          .where(eq(Tables.ResourceOperationsTable.resource_id, resource.id))
          .all();
        return { resource, operations };
      });

      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  /**
   * Register a full server configuration in a single transaction.
   */
  registerServer(
    params: {
      server: ServerUpsertValues;
      resources: {
        resource: ServerResourceUpsertValues;
        operations: ResourceOperationUpsertValues[];
      }[];
    }
  ): ReturningQueries<{
    server: ServerReturningValues;
    resources: {
      resource: ServerResourceReturningValues;
      operations: ResourceOperationReturningValues[];
    }[];
  } | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");

      // Sanitize empty strings to undefined for foreign keys
      const sanitize = (val: any) => (val === "" ? undefined : val);
      const sanitizedServer = {
        ...params.server,
        id: sanitize(params.server.id),
        server_type_id: sanitize(params.server.server_type_id),
        credential_id: sanitize(params.server.credential_id),
        project_id: sanitize(params.server.project_id),
      };

      const tx = this.db.$client.transaction(() => {
        const serverRes = this.upsertServer(sanitizedServer);
        if (serverRes.error || !serverRes.data) throw serverRes.error ?? new Error('Failed to upsert server');
        const server = serverRes.data;

        const resourcesWithOps: {
          resource: ServerResourceReturningValues;
          operations: ResourceOperationReturningValues[];
        }[] = [];

        const incomingResourceIds: string[] = [];

        for (const resData of params.resources ?? []) {
          const resourceVals: ServerResourceUpsertValues = { 
            ...resData.resource, 
            id: sanitize(resData.resource.id),
            server_id: server.id 
          };
          const resourceRes = this.upsertServerResource(resourceVals);
          if (resourceRes.error || !resourceRes.data) throw resourceRes.error ?? new Error('Failed to upsert server resource');
          const resource = resourceRes.data;
          incomingResourceIds.push(resource.id);

          const operations: ResourceOperationReturningValues[] = [];
          const incomingOpIds: string[] = [];

          for (const opData of resData.operations ?? []) {
            const opVals: ResourceOperationUpsertValues = { 
              ...opData, 
              id: sanitize(opData.id),
              resource_id: resource.id 
            };
            const opRes = this.upsertResourceOperation(opVals);
            if (opRes.error || !opRes.data) throw opRes.error ?? new Error('Failed to upsert resource operation');
            const op = opRes.data;
            operations.push(op);
            incomingOpIds.push(op.id);
          }

          // Delete operations not in the incoming list for this resource
          if (incomingOpIds.length > 0) {
            this.db!.delete(Tables.ResourceOperationsTable)
              .where(and(
                eq(Tables.ResourceOperationsTable.resource_id, resource.id),
                notInArray(Tables.ResourceOperationsTable.id, incomingOpIds)
              )).run();
          } else {
            this.db!.delete(Tables.ResourceOperationsTable)
              .where(eq(Tables.ResourceOperationsTable.resource_id, resource.id)).run();
          }

          resourcesWithOps.push({ resource, operations });
        }

        // Delete resources not in the incoming list for this server
        if (incomingResourceIds.length > 0) {
          this.db!.delete(Tables.ServerResourcesTable)
            .where(and(
              eq(Tables.ServerResourcesTable.server_id, server.id),
              notInArray(Tables.ServerResourcesTable.id, incomingResourceIds)
            )).run();
        } else {
          this.db!.delete(Tables.ServerResourcesTable)
            .where(eq(Tables.ServerResourcesTable.server_id, server.id)).run();
        }

        return { server, resources: resourcesWithOps };
      });

      const result = tx();
      return { data: result };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
  /**
   * Register a full instance configuration including destinations and mappings in a single transaction.
   */
  registerInstance(
    params: {
      instance: InstanceUpsertValues;
      destinations: {
        destination: Omit<InstanceDestinationUpsertValues, 'instance_id'>;
        mapping?: Omit<DataMappingUpsertValues, 'instance_destination_id'>;
      }[];
      tagIds?: string[];
    }
  ): ReturningQueries<{
    instance: InstanceReturningValues;
    destinations: InstanceDestinationReturningValues[];
    mappings: DataMappingReturningValues[];
  } | null> {
    try {
      if (!this.db) throw Error("The database has not been instantiated.");

      const tx = this.db.$client.transaction(() => {
        // Upsert standard Instance structure
        const instRes = this.instances.upsert(params.instance);
        if (instRes.error || !instRes.data) throw instRes.error ?? new Error('Failed to upsert instance');
        const instance = instRes.data;

        // Tags linkage
        if (params.tagIds) {
          const syncRes = this.instanceTags.syncTags(instance.id, params.tagIds);
          if (syncRes.error) throw syncRes.error;
        }

        // Ensure fresh layout: deleting old destinations entirely simplifies the update
        if (params.instance.id) {
          this.instanceDestinations.deleteByInstance(params.instance.id);
        }

        const createdDestinations: InstanceDestinationReturningValues[] = [];
        const createdMappings: DataMappingReturningValues[] = [];

        for (const dest of params.destinations) {
          const destValues: InstanceDestinationUpsertValues = { ...dest.destination, instance_id: instance.id };
          const destRes = this.instanceDestinations.upsert(destValues);
          if (destRes.error || !destRes.data) throw destRes.error ?? new Error('Failed to upsert destination');
          const createdDest = destRes.data;
          createdDestinations.push(createdDest);

          if (dest.mapping) {
            const mapValues: DataMappingUpsertValues = { ...dest.mapping, instance_destination_id: createdDest.id };
            const mapRes = this.dataMappings.upsert(mapValues);
            if (mapRes.error || !mapRes.data) throw mapRes.error ?? new Error('Failed to upsert mapping');
            createdMappings.push(mapRes.data);
          }
        }

        return { instance, destinations: createdDestinations, mappings: createdMappings };
      });

      const result = tx();
      return { data: result };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export const dbManager = DatabaseService.getInstance(db);