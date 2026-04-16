import { Logger } from '@/simple-logger';
import { 
    ServerReturningValues,
    CredentialReturningValues, 
    ServerResourceReturningValues,
    ResourceOperationReturningValues,
    AuthorizationsTypeReturningValues
} from 'nmg8-db';
import { ServerTypeConstructor } from './server-types';

export interface DestinationAdapter {
  send(payload?: any): Promise<any>;
  test(payload?: any): Promise<any>;
  discover(): Promise<any>;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'number' | 'select' | 'boolean';
  placeholder?: string;
  options?: { label: string; value: any }[];
  grid?: string;
}

export interface AdapterMetadata extends Omit<AuthorizationsTypeReturningValues, 'server_type_id'> {
  resourceFields?: ConfigField[];
  operationFields?: ConfigField[];
  server_type_id: ServerTypeConstructor;
}

export interface AdapterConstructor {
  new (
    server: ServerReturningValues, 
    resource: ServerResourceReturningValues,
    operation: ResourceOperationReturningValues,
    credentials: CredentialReturningValues, 
    logger: Logger
  ): DestinationAdapter;
  readonly metadata: AdapterMetadata;
}

export class AdapterRegistry {
  private static adapters = new Map<string, AdapterConstructor>();

  static register(constructor: AdapterConstructor) {
    this.adapters.set(constructor.metadata.id!, constructor);
  }

  static get(id: string): AdapterConstructor | undefined {
    return this.adapters.get(id);
  }

  static getAllMetadata() {
    return Object.values(Array.from(this.adapters.values()).map(constructor => {
      const { server_type_id, ...metadata } = constructor.metadata;
      return {
        ...metadata,
        server_type_id: server_type_id.metadata.id,
      }
    }));
  }

  static async syncWithDatabase() {
    const { dbManager } = await import('nmg8-db');
    const adapterMetadata = this.getAllMetadata();
    
    for (const metadata of adapterMetadata) {
      // Sync Authorization Type
      const { resourceFields, operationFields, ...authType } = metadata;
      await dbManager.authorizationTypes.upsert({
        ...authType,
      });
      
      // Note: We could also sync resource/operation field definitions to a new table 
      // if we wanted the UI to know what fields to show for a given server type/resource.
    }
  }
}

export function CredentialAdapter() {
  return function (constructor: AdapterConstructor) {
    AdapterRegistry.register(constructor);
  };
}

export abstract class BaseAdapter<TCreds = any> implements DestinationAdapter {
  constructor(
    protected readonly server: ServerReturningValues,
    protected readonly resource: ServerResourceReturningValues,
    protected readonly operation: ResourceOperationReturningValues,
    protected readonly credentials: CredentialReturningValues,
    protected readonly logger: Logger
  ) {}

  /**
   * Main execution method. Called when an operation is triggered.
   */
  abstract send(payload?: any): Promise<any>;

  /**
   * Connection test method. Used in Credential and Server dialogs.
   */
  abstract test(payload?: any): Promise<any>;

  /**
   * Introspection method. Used to discover tables, collections, or endpoints.
   */
  async discover(): Promise<any> {
    return [];
  }

  protected get credentialData(): TCreds {
    return (this.credentials?.data as TCreds) ?? ({} as TCreds);
  }

  protected get headers(): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        ...(this.server?.headers as Record<string, string> ?? {}),
      };
  }
}
