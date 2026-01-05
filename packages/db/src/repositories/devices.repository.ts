import type { DBType } from "../db";
import { Tables } from "../db";
import { eq } from 'drizzle-orm';
import type { DeviceUpsertValues, DeviceReturningValues, ReturningQueries } from '../types';

export class DevicesRepository {
  constructor(private db: DBType) {}

  create(values: DeviceUpsertValues): ReturningQueries<DeviceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DeviceTable).values(values).returning().get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  upsert(values: DeviceUpsertValues): ReturningQueries<DeviceReturningValues | null> {
    try {
      const data = this.db.insert(Tables.DeviceTable)
        .values(values)
        .onConflictDoUpdate({ target: Tables.DeviceTable.id, set: values })
        .returning()
        .get();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findById(id: string): ReturningQueries<DeviceReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.DeviceTable).where(eq(Tables.DeviceTable.id, id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  findByDeviceId(device_id: string): ReturningQueries<DeviceReturningValues | null> {
    try {
      const data = this.db.select().from(Tables.DeviceTable).where(eq(Tables.DeviceTable.device_id, device_id)).get() ?? null;
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }

  listAll(): ReturningQueries<DeviceReturningValues[]> {
    try {
      const data = this.db.select().from(Tables.DeviceTable).all();
      return { data };
    } catch (error: unknown) {
      return { error, data: [] };
    }
  }

  delete(id: string): ReturningQueries<unknown> {
    try {
      const data = this.db.delete(Tables.DeviceTable).where(eq(Tables.DeviceTable.id, id)).run();
      return { data };
    } catch (error: unknown) {
      return { error, data: null };
    }
  }
}

export default DevicesRepository;
