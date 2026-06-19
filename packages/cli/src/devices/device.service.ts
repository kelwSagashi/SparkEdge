import { Service } from 'spark-edge-di';
import { dbManager } from 'spark-edge-db';
import type { ReturningQueries } from 'spark-edge-db';
import type { DeviceUpsertValues, DeviceReturningValues } from 'spark-edge-db';

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

