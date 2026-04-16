import { Get, Post, RestController } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { AuthenticatedRequest } from '@/auth/authenticated-request';

@RestController('/fallback')
export class FallbackController {
  @Get('/')
  async listAll() {
    const result = dbManager.localFallback.listPending();
    return { data: result.data, error: result.error };
  }

  @Post('/:id/retry')
  async retry(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.localFallback.markAsSending(req.params.id);
    return { data: result.data, error: result.error };
  }
}
