import { ServerService } from './server.service';
import type ServerRequest from './server.request';
import { Delete, Get, Post, Put, RestController } from '@nmg8/di';

@RestController('/servers')
export class ServersController {
  constructor(readonly serverService: ServerService) {}

  @Get('/')
  async list() {
    return this.serverService.list();
  }

  @Get('/:id')
  async find(request: ServerRequest.IdParam) {
    return this.serverService.find(request.params.id);
  }

  @Post('/')
  async create(request: ServerRequest.Create) {
    return this.serverService.create(request.body);
  }

  @Post('/register')
  async register(request: ServerRequest.Register) {
    const userId = request.user?.id;
    return this.serverService.register(userId, request.body);
  }

  @Put('/:id')
  async update(request: ServerRequest.Update) {
    return this.serverService.update(request.params.id, request.body);
  }

  @Delete('/:id')
  async delete(request: ServerRequest.IdParam) {
    return this.serverService.remove(request.params.id);
  }
}

export default ServersController;
