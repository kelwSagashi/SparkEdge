import type { DownloadedScriptUpsertValues } from 'spark-edge-db/src/types';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace ScriptRequest {
  export type Create = AuthenticatedRequest<{}, {}, DownloadedScriptUpsertValues>;
  export type Update = AuthenticatedRequest<{ id: string }, {}, Partial<DownloadedScriptUpsertValues>>;
  export type IdParam = AuthenticatedRequest<{ id: string }>;
  export type HubSearch = AuthenticatedRequest<{}, { query?: string; page?: string }>;
}

export default ScriptRequest;

