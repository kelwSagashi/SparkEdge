import { Delete, Get, Post, Put, RestController } from '@spark-edge/di';
import { dbManager } from 'spark-edge-db';
import type { AuthenticatedRequest } from '@/auth/authenticated-request';

@RestController('/projects')
export class ProjectsController {
  @Get('/')
  async list(req: AuthenticatedRequest) {
    const userId = (req as any).user?.id;
    if (!userId) return { data: [], error: null };
    const result = dbManager.projects.findByOwner(userId);
    return { data: result.data, error: result.error };
  }

  @Get('/:id')
  async getOne(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.projects.findById(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Post('/')
  async create(req: AuthenticatedRequest<{}, {}, { name: string; key: string; description?: string; visibility?: 'private' | 'public' }>) {
    const userId = (req as any).user?.id;
    const result = dbManager.projects.upsert({ ...req.body, owner_id: userId });
    return { data: result.data, error: result.error };
  }

  @Put('/:id')
  async update(req: AuthenticatedRequest<{ id: string }, {}, { name?: string; description?: string; visibility?: 'private' | 'public' }>) {
    const result = dbManager.projects.update(req.params.id, req.body);
    return { data: result.data, error: result.error };
  }

  @Delete('/:id')
  async remove(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.projects.delete(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Get('/:id/members')
  async listMembers(req: AuthenticatedRequest<{ id: string }>) {
    const result = dbManager.projectMembers.findByProject(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Post('/:id/members')
  async addMember(req: AuthenticatedRequest<{ id: string }, {}, { user_id: string; role?: 'owner' | 'editor' | 'viewer' }>) {
    const result = dbManager.projectMembers.upsert({
      project_id: req.params.id,
      user_id: req.body.user_id,
      role: req.body.role ?? 'viewer',
    });
    return { data: result.data, error: result.error };
  }
}

