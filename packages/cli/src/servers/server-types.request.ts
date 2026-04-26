import type { ServerTypeUpsertValues } from 'spark-edge-db';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace ServerTypesRequest {
  export type Create = AuthenticatedRequest<{}, {}, ServerTypeUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, ServerTypeUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default ServerTypesRequest;

