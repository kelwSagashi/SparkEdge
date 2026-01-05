import type { UserUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from 'nmg8-workflow';

export namespace UserRequest {
  export type Create = AuthenticatedRequest<{}, {}, UserUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, Partial<UserUpsertValues>>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default UserRequest;
