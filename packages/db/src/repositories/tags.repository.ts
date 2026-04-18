import { and, eq, like, isNull, or } from 'drizzle-orm';
import type { DBType } from '../db';
import { TagsTable } from '../db/schemas';
import type { TagUpsertValues, TagReturningValues, ReturningQueries } from '../types';

export class TagsRepository {
  constructor(private db: DBType) {}

  findAll(projectId?: string): ReturningQueries<TagReturningValues[]> {
    try {
      const query = projectId 
        ? this.db.select().from(TagsTable).where(eq(TagsTable.project_id, projectId))
        : this.db.select().from(TagsTable);
      return { data: query.all() };
    } catch (error) { return { error, data: [] }; }
  }

  findById(id: string): ReturningQueries<TagReturningValues | undefined> {
    try {
      return { data: this.db.select().from(TagsTable).where(eq(TagsTable.id, id)).get() };
    } catch (error) { return { error, data: undefined }; }
  }

  findByNameAndProject(name: string, projectId?: string): ReturningQueries<TagReturningValues | undefined> {
    try {
      const where = projectId 
        ? and(eq(TagsTable.name, name), eq(TagsTable.project_id, projectId))
        : and(eq(TagsTable.name, name), isNull(TagsTable.project_id));
      return { data: this.db.select().from(TagsTable).where(where).get() };
    } catch (error) { return { error, data: undefined }; }
  }

  search(query: string, projectId?: string): ReturningQueries<TagReturningValues[]> {
    try {
      const searchPattern = `%${query}%`;
      const where = projectId
        ? and(like(TagsTable.name, searchPattern), eq(TagsTable.project_id, projectId))
        : and(like(TagsTable.name, searchPattern), isNull(TagsTable.project_id));
      
      return { data: this.db.select().from(TagsTable).where(where).all() };
    } catch (error) { return { error, data: [] }; }
  }

  upsert(values: TagUpsertValues): ReturningQueries<TagReturningValues | null> {
    try {
      return {
        data: this.db.insert(TagsTable)
          .values(values)
          .onConflictDoUpdate({ 
            target: [TagsTable.project_id, TagsTable.name], 
            set: { color: values.color } 
          })
          .returning().get()
      };
    } catch (error) { return { error, data: null }; }
  }

  delete(id: string): ReturningQueries<TagReturningValues | null> {
    try {
      return { data: this.db.delete(TagsTable).where(eq(TagsTable.id, id)).returning().get() ?? null };
    } catch (error) { return { error, data: null }; }
  }
}





