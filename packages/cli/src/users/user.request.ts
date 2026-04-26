import type { UserUpsertValues } from 'spark-edge-db';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace UserRequest {
  export type Create = AuthenticatedRequest<{}, {}, UserUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, Partial<UserUpsertValues>>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
  export type ProjectParam = AuthenticatedRequest<{ id: string, project: string }>;
}

export default UserRequest;

