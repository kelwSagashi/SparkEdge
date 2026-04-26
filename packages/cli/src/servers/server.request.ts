import type { 
  ServerUpsertValues, 
  ServerResourceUpsertValues, 
  ResourceOperationUpsertValues 
} from 'spark-edge-db';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace ServerRequest {
  export type Create = AuthenticatedRequest<{}, {}, ServerUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, ServerUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;

  export type Register = AuthenticatedRequest<{}, {}, { 
    server: ServerUpsertValues; 
    resources: {
      resource: ServerResourceUpsertValues;
      operations: ResourceOperationUpsertValues[];
    }[];
  }>;

  export type Execute = AuthenticatedRequest<{}, {}, { resource_operation_id: string; payload?: any }>;
}

export default ServerRequest;

