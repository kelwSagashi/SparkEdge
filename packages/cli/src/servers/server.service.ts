import { Service } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import type { 
  ServerUpsertValues, 
  ServerResourceUpsertValues, 
  ResourceOperationUpsertValues 
} from 'spark-edge-db';
import { CredentialsService } from '../credentials/credentials.service';

@Service()
export class ServerService {
  constructor(
    private readonly credentialsService: CredentialsService
  ) {}

  async create(values: ServerUpsertValues) {
    return dbManager.servers.create(values as any);
  }

  async update(id: string, values: ServerUpsertValues) {
    return dbManager.servers.upsert({id, ...values});
  }

  async find(id: string) {
    return dbManager.servers.findById(id);
  }

  async list() {
    return dbManager.servers.listAll();
  }

  async listResources(id: string) {
    return dbManager.listAllServerResources(id);
  }

  async remove(id: string) {
    return dbManager.servers.delete(id);
  }

  async register(payload: { 
    server: ServerUpsertValues; 
    resources: {
      resource: ServerResourceUpsertValues;
      operations: ResourceOperationUpsertValues[];
    }[];
  }) {
    return dbManager.registerServer({ 
      server: payload.server, 
      resources: payload.resources 
    });
  }

  async executeOperation(resource_operation_id: string, payload?: any) {
    return this.credentialsService.executeOperation(resource_operation_id, payload);
  }
}

export default ServerService;

