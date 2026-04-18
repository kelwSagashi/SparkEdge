import { axios_api_instance } from '@/server/instance';
import type { AuthorizationsTypeReturningValues, CredentialReturningValues, CredentialUpsertValues, ReturningQueries } from 'spark-edge-db/src/types';

export const credentialsApi = {
  list: () => axios_api_instance.get<ReturningQueries<CredentialReturningValues[]>>('/credentials').then((res) => res.data) ,
  getMeta: () => axios_api_instance.get<ReturningQueries<AuthorizationsTypeReturningValues[]>>('/credentials/config/meta').then((res) => res.data),
  get: (id: string) => axios_api_instance.get<ReturningQueries<CredentialReturningValues>>(`/credentials/${id}`).then((res) => res.data),
  create: (data: Partial<CredentialUpsertValues>) => axios_api_instance.post('/credentials', data).then((res) => res.data),
  update: (id: string, data: Partial<CredentialUpsertValues>) => axios_api_instance.put(`/credentials/${id}`, data).then((res) => res.data),
  delete: (id: string) => axios_api_instance.delete(`/credentials/${id}`).then((res) => res.data),
};

