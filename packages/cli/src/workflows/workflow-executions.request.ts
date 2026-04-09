import { AuthenticatedRequest } from 'nmg8-workflow';
import type { WorkflowExecutionUpsertValues } from 'nmg8-db/src/types';

export namespace WorkflowExecutionsRequest {
  export type Create = AuthenticatedRequest<{}, {}, WorkflowExecutionUpsertValues>;
  export type Update = AuthenticatedRequest<{ id: string }, {}, WorkflowExecutionUpsertValues>;
  export type IdParam = AuthenticatedRequest<{ id: string }>;
  export type IdParamEnable = AuthenticatedRequest<{ id: string, enabled?: boolean }>;
}

export default WorkflowExecutionsRequest;
