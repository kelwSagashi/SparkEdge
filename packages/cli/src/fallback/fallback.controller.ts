import { Get, Post, Delete, RestController } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import type { AuthenticatedRequest } from '@/auth/authenticated-request';
import { InstanceRunnerService } from '@/instances/instance-runner.service';
import { FallbackQueueService } from '@/instances/fallback-queue.service';

@RestController('/fallback')
export class FallbackController {
  constructor(
    private readonly instanceRunner: InstanceRunnerService,
    private readonly fallbackQueue: FallbackQueueService
  ) {}

  @Get('/')
  async listAll() {
    // List all including sent and failed for history
    const result = dbManager.localFallback.listAll();
    return { data: result.data, error: result.error };
  }

  @Get('/stats')
  async getStats() {
    return { data: this.fallbackQueue.getStats() };
  }

  @Post('/flush')
  async flush() {
    const sent = await this.fallbackQueue.flush(async (_instId: string, payload: string, destId?: string) => {
      if (!destId) return false;
      return this.instanceRunner.resendFallbackItem(destId, payload);
    });
    return { data: { sent } };
  }

  @Post('/:id/retry')
  async retry(req: AuthenticatedRequest<{ id: string }>) {
    const itemRes = dbManager.localFallback.findById(req.params.id);
    if (itemRes.error || !itemRes.data) return { error: 'Item not found' };

    const item = itemRes.data;
    if (!item.destination_id) return { error: 'Item has no destination ID' };

    const success = await this.instanceRunner.resendFallbackItem(item.destination_id, item.payload);
    if (success) {
      dbManager.localFallback.markAsSent(item.id);
    } else {
      dbManager.localFallback.incrementRetry(item.id, 'Manual retry failed');
    }

    return { data: { success } };
  }

  @Delete('/:id')
  async remove(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.localFallback.delete(req.params.id);
    return { data: result.data, error: result.error };
  }
}

