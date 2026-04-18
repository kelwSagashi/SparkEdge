import { Service } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';

@Service()
export class TagsService {
  listAll() { return dbManager.tags.findAll(); }
  findById(id: string) { return dbManager.tags.findById(id); }
  search(q: string, projectId?: string) { return dbManager.tags.search(q, projectId); }
  create(values: { name: string; color?: string; project_id?: string }) { return dbManager.tags.upsert(values); }
  delete(id: string) { return dbManager.tags.delete(id); }
  
  findByInstance(instanceId: string) { return dbManager.instanceTags.findByInstance(instanceId); }
  linkTag(instanceId: string, tagId: string) { return dbManager.instanceTags.link(instanceId, tagId); }
  unlinkTag(instanceId: string, tagId: string) { return dbManager.instanceTags.unlink(instanceId, tagId); }
  syncTags(instanceId: string, tagIds: string[]) { return dbManager.instanceTags.syncTags(instanceId, tagIds); }

  async findOrCreateByNames(names: string[], projectId?: string): Promise<string[]> {
    const tagIds: string[] = [];
    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      let existing = dbManager.tags.findByNameAndProject(trimmed, projectId);
      if (existing.data) {
        tagIds.push(existing.data.id);
      } else {
        const created = dbManager.tags.upsert({ name: trimmed, project_id: projectId });
        if (created.data) tagIds.push(created.data.id);
      }
    }
    return tagIds;
  }
}

