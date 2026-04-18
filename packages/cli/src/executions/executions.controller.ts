import { Get, RestController } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import type { AuthenticatedRequest } from '@/auth/authenticated-request';

@RestController('/executions')
export class ExecutionsController {
  @Get('/')
  async listAll() {
    const result = dbManager.instanceExecutions.listAll();
    return { data: result.data, error: result.error };
  }

  @Get('/:id')
  async getOne(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.instanceExecutions.findById(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Get('/instance/:instanceId')
  async listByInstance(req: AuthenticatedRequest<{ instanceId: string }>) {
    const result = dbManager.instanceExecutions.listByInstance(req.params.instanceId);
    return { data: result.data, error: result.error };
  }
}

