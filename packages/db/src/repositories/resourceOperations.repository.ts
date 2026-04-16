import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { ResourceOperationUpsertValues, ResourceOperationReturningValues, ReturningQueries } from '../types';

export class ResourceOperationsRepository {
  constructor(private db: DBType) {}

  create(values: ResourceOperationUpsertValues): ReturningQueries<ResourceOperationReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ResourceOperationsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: ResourceOperationUpsertValues): ReturningQueries<ResourceOperationReturningValues | null> {
    try {
      const data = this.db.insert(Tables.ResourceOperationsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.ResourceOperationsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listByResource(resource_id: string): ReturningQueries<ResourceOperationReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.ResourceOperationsTable).where(eq(Tables.ResourceOperationsTable.resource_id, resource_id)).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  findById(id: string): ReturningQueries<ResourceOperationReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.ResourceOperationsTable).where(eq(Tables.ResourceOperationsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.ResourceOperationsTable).where(eq(Tables.ResourceOperationsTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default ResourceOperationsRepository;
