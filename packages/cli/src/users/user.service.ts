import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ReturningQueries, UserUpsertValues, UserReturningValues } from 'nmg8-db/src/types';

@Service()
export class UserService {
  async listAll(): Promise<ReturningQueries<UserReturningValues[]>> {
    return dbManager.users.listAll();
  }

  async findById(id: string): Promise<ReturningQueries<UserReturningValues | null>> {
    return dbManager.users.findById(id);
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
}

export default UserService;
