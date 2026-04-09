import type { ServerUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from 'nmg8-workflow';
import type { CredentialUpsertValues, ServerEndpointsUpsertValues } from 'nmg8-db/src/types';

export namespace ServerRequest {
  export type Create = AuthenticatedRequest<{}, {}, ServerUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, ServerUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;

  export type Register = AuthenticatedRequest<{}, {}, { server: ServerUpsertValues; authorization: CredentialUpsertValues; endpoints: ServerEndpointsUpsertValues[] }>;
}

export default ServerRequest;
