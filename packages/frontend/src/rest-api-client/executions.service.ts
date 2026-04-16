import { axios_api_instance } from '@/server/instance';
import type { InstanceExecutionReturningValues, ReturningQueries } from 'nmg8-db/src/types';

export const executionsApi = {
  list: () =>
    axios_api_instance.get<ReturningQueries<InstanceExecutionReturningValues[]>>('/executions').then((res) => res.data),

  get: (id: string) =>
    axios_api_instance.get<ReturningQueries<InstanceExecutionReturningValues>>(`/executions/${id}`).then((res) => res.data),

  listByInstance: (instanceId: string) =>
    axios_api_instance.get<ReturningQueries<InstanceExecutionReturningValues[]>>(`/executions/instance/${instanceId}`).then((res) => res.data),
};
