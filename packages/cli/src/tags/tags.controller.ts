import { Delete, Get, Post, RestController } from 'spark-edge-di';
import { TagsService } from './tags.service';
import TagsRequest from './tags.request';

@RestController('/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('/')
  async list() {
    const result = this.tagsService.listAll();
    return { data: result.data, error: result.error };
  }

  @Get('/search')
  async search(req: TagsRequest.Search) {
    const q = (req.query as any)?.q ?? '';
    const projectId = (req.query as any)?.project_id;
    const result = this.tagsService.search(q, projectId);
    return { data: result.data, error: result.error };
  }

  @Post('/')
  async create(req: TagsRequest.Create) {
    const result = this.tagsService.create(req.body);
    return { data: result.data, error: result.error };
  }

  @Delete('/:id')
  async remove(req: TagsRequest.IdParam) {
    const result = this.tagsService.delete(req.params.id);
    return { data: result.data, error: result.error };
  }
}

