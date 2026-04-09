import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ServerTypeUpsertValues } from 'nmg8-db/src/types';

@Service()
export class ServerTypesService {
  async create(values: ServerTypeUpsertValues) {
    return dbManager.serverTypes.create(values as any);
  }

  async update(id: string, values: ServerTypeUpsertValues) {
    return dbManager.serverTypes.upsert({ id, ...values } as any);
  }

  async find(id: string) {
    return dbManager.serverTypes.findById(id);
  }

  async list() {
    return dbManager.serverTypes.listAll();
  }

  async remove(id: string) {
    return dbManager.serverTypes.delete(id);
  }
}

export default ServerTypesService;
