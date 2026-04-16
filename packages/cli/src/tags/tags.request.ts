import type { AuthenticatedRequest } from '@/auth/authenticated-request';

namespace TagsRequest {
  export type Create = AuthenticatedRequest<{}, {}, { name: string; color?: string; project_id?: string }>;
  export type Search = AuthenticatedRequest<{}, { q?: string; project_id?: string }>;
  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default TagsRequest;
