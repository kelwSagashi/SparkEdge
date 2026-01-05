import type { ServerUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from 'nmg8-workflow';

export namespace ServerRequest {
  export type Create = AuthenticatedRequest<{}, {}, ServerUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, ServerUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default ServerRequest;
