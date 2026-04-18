import type { DBType } from "../db";
import { Tables } from "../db";
import { eq, and } from 'drizzle-orm';
import type { DataMappingUpsertValues, DataMappingReturningValues, ReturningQueries } from '../types';

export class DataMappingsRepository {
  constructor(private db: DBType) {}

  create(values: DataMappingUpsertValues): ReturningQueries<DataMappingReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DataMappingsTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: DataMappingUpsertValues): ReturningQueries<DataMappingReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DataMappingsTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.DataMappingsTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<DataMappingReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.DataMappingsTable).where(eq(Tables.DataMappingsTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  getByInstanceDestination(instance_destination_id: string): ReturningQueries<DataMappingReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.DataMappingsTable)
        .where(eq(Tables.DataMappingsTable.instance_destination_id, instance_destination_id))
        .get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  deleteByInstanceDestination(instance_destination_id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.DataMappingsTable).where(eq(Tables.DataMappingsTable.instance_destination_id, instance_destination_id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default DataMappingsRepository;





