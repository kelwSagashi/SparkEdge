import type { CredentialUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace CredentialsRequest {
  export type Create = AuthenticatedRequest<{}, {}, CredentialUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, CredentialUpsertValues>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default CredentialsRequest;
