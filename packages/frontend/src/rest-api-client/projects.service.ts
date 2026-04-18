import type { ProjectUpsertValues } from 'spark-edge-db/src/types';
import { axios_api_instance } from '@/server/instance';


namespace ProjectRequest {
  export type Create = ProjectUpsertValues;
  export type Update = Partial<ProjectUpsertValues>;
}
export const projectsApi = {
  list: () => axios_api_instance.get('/projects').then((res) => res.data),

  get: (id: string) => axios_api_instance.get(`/projects/${id}`).then((res) => res.data),

  create: (data: ProjectRequest.Create) => axios_api_instance.post('/projects', data).then((res) => res.data),

  update: (id: string, data: ProjectRequest.Update) => axios_api_instance.put(`/projects/${id}`, data).then((res) => res.data),

  delete: (id: string) => axios_api_instance.delete(`/projects/${id}`).then((res) => res.data),

  listMembers: (id: string) => axios_api_instance.get(`/projects/${id}/members`).then((res) => res.data),

  addMember: (id: string, data: { user_id: string; role?: string }) => axios_api_instance.post(`/projects/${id}/members`, data).then((res) => res.data),
};

