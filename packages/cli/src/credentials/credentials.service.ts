import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { CredentialUpsertValues } from 'nmg8-db/src/types';

@Service()
export class CredentialsService {
  async create(values: CredentialUpsertValues) {
    return dbManager.credentials.create(values);
  }

  async update(id: string, values: CredentialUpsertValues) {
    return dbManager.credentials.upsert({ id, ...values });
  }

  async find(id: string) {
    return dbManager.credentials.findById(id);
  }

  async list() {
    return dbManager.credentials.listAll();
  }

  async remove(id: string) {
    return dbManager.credentials.delete(id);
  }
}

export default CredentialsService;
