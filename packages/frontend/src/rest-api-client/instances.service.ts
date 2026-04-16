import type { DataMappingUpsertValues, InstanceDestinationUpsertValues, InstanceReturningValues, InstanceUpsertValues, ReturningQueries } from 'nmg8-db/src/types';
import { axios_api_instance } from '@/server/instance';

export namespace InstanceRequest {

  export interface InstancePayload {
    instance: InstanceUpsertValues;
    destinations: {
      destination: Omit<InstanceDestinationUpsertValues, 'instance_id'>;
      mapping?: Omit<DataMappingUpsertValues, 'instance_destination_id'>;
    }[];
  }

  export type Create = InstancePayload;
  export type Update = Partial<InstancePayload>;
}

export const instancesApi = {
  list: () => axios_api_instance.get<ReturningQueries<InstanceReturningValues[]>>('/instances'),

  listActive: () => axios_api_instance.get<ReturningQueries<InstanceReturningValues[]>>('/instances/active'),

  listByProject: (projectId: string) => axios_api_instance.get<ReturningQueries<InstanceReturningValues[]>>(`/instances/project/${projectId}`),

  get: (id: string) => axios_api_instance.get<ReturningQueries<InstanceReturningValues>>(`/instances/${id}`),

  create: (data: InstanceRequest.Create) => axios_api_instance.post('/instances', data),

  update: (id: string, data: InstanceRequest.Update) => axios_api_instance.put(`/instances/${id}`, data),

  delete: (id: string) => axios_api_instance.delete(`/instances/${id}`),

  trigger: (id: string) => axios_api_instance.post(`/instances/${id}/trigger`),
};

export const executionsApi = {
  list: () => axios_api_instance.get<ReturningQueries<InstanceReturningValues>>('/executions'),
};
