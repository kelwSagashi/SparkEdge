import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { ReturningQueries } from 'nmg8-db/src/types';
import type { DeviceUpsertValues, DeviceReturningValues } from 'nmg8-db/src/types';

@Service()
export class DeviceService {
  async listAll(): Promise<ReturningQueries<DeviceReturningValues[]>> {
    return dbManager.devices.listAll();
  }

  async findById(id: string): Promise<ReturningQueries<DeviceReturningValues | null>> {
    return dbManager.devices.findById(id);
  }

  async upsert(values: DeviceUpsertValues): Promise<ReturningQueries<DeviceReturningValues | null>> {
    return dbManager.devices.upsert(values);
  }

  async create(values: DeviceUpsertValues): Promise<ReturningQueries<DeviceReturningValues | null>> {
    return dbManager.devices.create(values);
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    return dbManager.devices.delete(id);
  }
}

export default DeviceService;
