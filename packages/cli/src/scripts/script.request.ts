import type { CodeInstanceUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from 'nmg8-workflow';

export namespace ScriptRequest {
  export type Create = AuthenticatedRequest<{}, {}, CodeInstanceUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, Partial<CodeInstanceUpsertValues>>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default ScriptRequest;
