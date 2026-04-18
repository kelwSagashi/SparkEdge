import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ReturningQueries, DownloadedScriptUpsertValues, DownloadedScriptReturningValues } from 'nmg8-db/src/types';

@Service()
export class ScriptService {
  async listAll(): Promise<ReturningQueries<DownloadedScriptReturningValues[]>> {
    return dbManager.downloadedScripts.listAll();
  }

  async findById(id: string): Promise<ReturningQueries<DownloadedScriptReturningValues | null>> {
    return dbManager.downloadedScripts.findById(id);
  }

  async upsert(values: DownloadedScriptUpsertValues): Promise<ReturningQueries<DownloadedScriptReturningValues | null>> {
    return dbManager.downloadedScripts.upsert(values);
  }

  async update(id: string, values: Partial<DownloadedScriptUpsertValues>): Promise<ReturningQueries<DownloadedScriptReturningValues | null>> {
    return dbManager.downloadedScripts.update(id, values);
  }

  async create(values: DownloadedScriptUpsertValues): Promise<ReturningQueries<DownloadedScriptReturningValues | null>> {
    return dbManager.downloadedScripts.create(values);
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    const scriptRes = await this.findById(id);
    if (scriptRes.data && (scriptRes.data as any).local_path) {
      try {
        const fullPath = (scriptRes.data as any).local_path;
        if (require('fs').existsSync(fullPath)) {
          require('fs').rmSync(fullPath, { recursive: true, force: true });
        }
      } catch (err) {
        console.error('Failed to delete script files:', err);
      }
    }
    return dbManager.downloadedScripts.delete(id);
  }
}

export default ScriptService;
