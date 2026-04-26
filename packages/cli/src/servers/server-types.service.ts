import { Service } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import type { ServerTypeUpsertValues } from 'spark-edge-db';

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

