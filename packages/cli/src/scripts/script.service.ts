import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ReturningQueries, CodeInstanceUpsertValues, CodeInstanceReturningValues } from 'nmg8-db/src/types';

@Service()
export class ScriptService {
  async listAll(): Promise<ReturningQueries<CodeInstanceReturningValues[]>> {
    return dbManager.codeInstances.listAll();
  }

  async listSampleScripts(): Promise<ReturningQueries<CodeInstanceReturningValues[]>> {
    // DatabaseService contains a helper that returns example scripts
    // Wrap the call into ReturningQueries for consistency
    try {
      const resp = dbManager.listSampleScripts();
      return { data: resp.data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  async findById(id: string): Promise<ReturningQueries<CodeInstanceReturningValues | null>> {
    return dbManager.codeInstances.findById(id);
  }

  async upsert(values: CodeInstanceUpsertValues): Promise<ReturningQueries<CodeInstanceReturningValues | null>> {
    return dbManager.codeInstances.upsert(values);
  }

  async create(values: CodeInstanceUpsertValues): Promise<ReturningQueries<CodeInstanceReturningValues | null>> {
    return dbManager.codeInstances.create(values);
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    return dbManager.codeInstances.delete(id);
  }
}

export default ScriptService;
