import type { ServerTypeUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace ServerTypesRequest {
  export type Create = AuthenticatedRequest<{}, {}, ServerTypeUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, ServerTypeUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default ServerTypesRequest;
