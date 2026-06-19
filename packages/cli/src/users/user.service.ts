import { Service } from 'spark-edge-di';
import { dbManager } from 'spark-edge-db';
import type { ReturningQueries, UserUpsertValues, UserReturningValues } from 'spark-edge-db';

@Service()
export class UserService {
  async listAll(): Promise<ReturningQueries<UserReturningValues[]>> {
    return dbManager.users.listAll();
  }

  async findById(id: string): Promise<ReturningQueries<UserReturningValues | null>> {
    return dbManager.users.findById(id);
  }

  async findProjectUserByName(id: string, project: string) {
    return dbManager.users.findProjectUserByName(id, project);
  }
  async findByEmail(email: string): Promise<ReturningQueries<UserReturningValues | null>> {
    return dbManager.users.findByEmail(email);
  }

  async upsert(values: UserUpsertValues): Promise<ReturningQueries<UserReturningValues | null>> {
    return dbManager.users.upsert(values);
  }

  async create(values: UserUpsertValues): Promise<ReturningQueries<UserReturningValues | null>> {
    return dbManager.users.create(values);
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    return dbManager.users.delete(id);
  }

  async createApiKey(id: string): Promise<ReturningQueries<{ userId: string; apiKey: string } | null>> {
    return dbManager.users.createApiKey(id);
  }
}

export default UserService;

