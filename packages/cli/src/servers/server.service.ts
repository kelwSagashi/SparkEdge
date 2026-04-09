import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { CredentialUpsertValues, ServerEndpointsUpsertValues, ServerUpsertValues } from 'nmg8-db/src/types';

@Service()
export class ServerService {
  async create(values: ServerUpsertValues) {
    return dbManager.servers.create(values as any);
  }

  async update(id: string, values: ServerUpsertValues) {
    return dbManager.servers.upsert({id, ...values});
  }

  async find(id: string) {
    return dbManager.servers.findById(id);
  }

  async list() {
    return dbManager.servers.listAll();
  }

  async remove(id: string) {
    return dbManager.servers.delete(id);
  }

  async register(created_by: string | undefined, payload: { server: ServerUpsertValues; authorization: CredentialUpsertValues; endpoints: ServerEndpointsUpsertValues[] }) {
    const serverValues = { ...payload.server };
    if (created_by && !serverValues.created_by) serverValues.created_by = created_by;

    return dbManager.registerServer({ server: serverValues, authorization: payload.authorization, endpoints: payload.endpoints });
  }
}

export default ServerService;
