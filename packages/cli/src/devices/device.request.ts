import type { DeviceUpsertValues } from 'nmg8-db/src/types';
import { AuthenticatedRequest } from '@/auth/authenticated-request';

export namespace DeviceRequest {
  export type Create = AuthenticatedRequest<{}, {}, DeviceUpsertValues>;

  export type Update = AuthenticatedRequest<{ id: string }, {}, Partial<DeviceUpsertValues>>;

  export type IdParam = AuthenticatedRequest<{ id: string }>;
}

export default DeviceRequest;
