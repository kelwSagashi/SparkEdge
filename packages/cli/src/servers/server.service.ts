import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ServerUpsertValues } from 'nmg8-db/src/types';

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
}

export default ServerService;
