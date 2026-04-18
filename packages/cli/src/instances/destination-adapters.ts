import { Logger } from '@/simple-logger';
import { 
    ServerReturningValues, 
    CredentialReturningValues, 
    ServerResourceReturningValues,
    ResourceOperationReturningValues
} from 'spark-edge-db';
import { 
  AdapterRegistry, 
  DestinationAdapter 
} from './adapter-base';

export * from './adapter-base';

export class DestinationFactory {
  static create(
    server: ServerReturningValues,
    resource: ServerResourceReturningValues,
    operation: ResourceOperationReturningValues,
    credentials: CredentialReturningValues | null, 
    logger: Logger
  ): DestinationAdapter {
    // Try server.type first, fallback to operation.type (used for tests/discovery)
    const adapterId = server?.type || (operation as any)?.type;
    
    if (!adapterId) {
        throw new Error('No adapter ID provided (server.type or operation.type must be defined)');
    }

    const Adapter = AdapterRegistry.get(adapterId);
    if (!Adapter) {
        throw new Error(`No adapter registered for adapter ID: ${adapterId}`);
    }

    // @ts-ignore - credentials might be null, BaseAdapter handles it
    return new Adapter(server, resource, operation, credentials, logger);
  }
}

