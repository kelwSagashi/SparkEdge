import { Post, Get, Put, Delete, RestController } from '@nmg8/di';
import { ServerTypesService } from './server-types.service';
import ServerTypesRequest from './server-types.request';

@RestController('/server-types')
export class ServerTypesController {
  constructor(readonly svc: ServerTypesService) {}

  @Get('/')
  async list() {
    return this.svc.list();
  }

  @Get('/:id')
  async find(request: ServerTypesRequest.IdParam) {
    return this.svc.find(request.params.id);
  }

  @Post('/')
  async create(request: ServerTypesRequest.Create) {
    return this.svc.create(request.body);
  }

  @Put('/:id')
  async update(request: ServerTypesRequest.Update) {
    return this.svc.update(request.params.id, request.body);
  }

  @Delete('/:id')
  async delete(request: ServerTypesRequest.IdParam) {
    return this.svc.remove(request.params.id);
  }
}

export default ServerTypesController;
