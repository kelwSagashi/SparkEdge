import { eq, and } from 'drizzle-orm';
import type { DBType } from '../db';
import { InstanceTagsTable, TagsTable } from '../db/schemas';
import type { InstanceTagReturningValues, ReturningQueries, TagReturningValues } from '../types';

export class InstanceTagsRepository {
  constructor(private db: DBType) {}

  findByInstance(instanceId: string): ReturningQueries<TagReturningValues[]> {
    try {
      const rows = this.db
        .select({ tag: TagsTable })
        .from(InstanceTagsTable)
        .innerJoin(TagsTable, eq(InstanceTagsTable.tag_id, TagsTable.id))
        .where(eq(InstanceTagsTable.instance_id, instanceId))
        .all();
      return { data: rows.map(r => r.tag) };
    } catch (error) { return { error, data: [] }; }
  }

  link(instanceId: string, tagId: string): ReturningQueries<InstanceTagReturningValues | null> {
    try {
      const existing = this.db.select().from(InstanceTagsTable)
        .where(and(eq(InstanceTagsTable.instance_id, instanceId), eq(InstanceTagsTable.tag_id, tagId)))
        .get();
      if (existing) return { data: existing };
      return {
        data: this.db.insert(InstanceTagsTable).values({ instance_id: instanceId, tag_id: tagId }).returning().get()
      };
    } catch (error) { return { error, data: null }; }
  }

  unlink(instanceId: string, tagId: string): ReturningQueries<boolean> {
    try {
      this.db.delete(InstanceTagsTable)
        .where(and(eq(InstanceTagsTable.instance_id, instanceId), eq(InstanceTagsTable.tag_id, tagId)))
        .run();
      return { data: true };
    } catch (error) { return { error, data: false }; }
  }

  syncTags(instanceId: string, tagIds: string[]): ReturningQueries<TagReturningValues[]> {
    try {
      this.db.delete(InstanceTagsTable).where(eq(InstanceTagsTable.instance_id, instanceId)).run();
      for (const tagId of tagIds) {
        this.db.insert(InstanceTagsTable).values({ instance_id: instanceId, tag_id: tagId }).run();
      }
      return this.findByInstance(instanceId);
    } catch (error) { return { error, data: [] }; }
  }
}





