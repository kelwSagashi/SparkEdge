import { axios_api_instance } from '@/server/instance';
import type { ReturningQueries } from 'nmg8-db/src/types';

export const fallbackApi = {
  listPending: () =>
    axios_api_instance.get<ReturningQueries<any[]>>('/fallback').then((res) => res.data),

  retry: (id: string) =>
    axios_api_instance.post<ReturningQueries<any>>(`/fallback/${id}/retry`).then((res) => res.data),
};
