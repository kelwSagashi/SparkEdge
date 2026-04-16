import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { 
  CredentialUpsertValues,
} from 'nmg8-db';
import { DestinationFactory } from '../instances/destination-adapters';
import { Logger } from '@/simple-logger';


export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'number';
  placeholder?: string;
  grid?: string;
}

@Service()
export class CredentialsService {
  getMeta() {
    return dbManager.authorizationTypes.listAll();
  }

  async create(values: CredentialUpsertValues) {
    return dbManager.credentials.create(values);
  }

  async update(id: string, values: CredentialUpsertValues) {
    return dbManager.credentials.upsert({ id, ...values });
  }

  async find(id: string) {
    return dbManager.credentials.findById(id);
  }

  async list() {
    return dbManager.credentials.listAll();
  }

  async test(id: string) {
    return dbManager.credentials.findById(id);
  }

  async remove(id: string) {
    return dbManager.credentials.delete(id);
  }

  async executeOperation(resource_operation_id: string, payload?: any) {
    const logger = new Logger();
    try {
      const operationRes = dbManager.resourceOperations.findById(resource_operation_id);
      if (operationRes.error || !operationRes.data) throw new Error('Operation not found');
      const operation = operationRes.data;
  
      const resourceRes = dbManager.serverResources.findById(operation.resource_id);
      if (resourceRes.error || !resourceRes.data) throw new Error('Resource not found');
      const resource = resourceRes.data;

      const serverRes = dbManager.servers.findById(resource.server_id);
      if (serverRes.error || !serverRes.data) throw new Error('Server not found');
      const server = serverRes.data;
      
      let credentials = null;
      if (server.credential_id) {
        const credsRes = dbManager.credentials.findById(server.credential_id);
        if (!credsRes.error && credsRes.data) {
          credentials = credsRes.data;
        }
      }
      
      const adapter = DestinationFactory.create(
        server,
        resource,
        operation,
        credentials,
        logger
      );
      
      const result = await adapter.send(payload);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testCredential(auth_type_id: string, data: any) {
    const logger = new Logger();
    try {
      // Create a virtual server/operation to satisfy factory requirements
      const adapter = DestinationFactory.create(
        { type: auth_type_id } as any, // server
        {} as any, // resource
        { type: 'test' } as any, // operation
        { data } as any, // credentials
        logger
      );
      
      const result = await adapter.test();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Credential test failure:', error);
      return { success: false, error: error.message };
    }
  }
}
