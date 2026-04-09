import { Post, Get, Put, Delete, RestController } from '@nmg8/di';
import { CredentialsService } from './credentials.service';
import CredentialsRequest from './credentials.request';

@RestController('/credentials')
export class CredentialsController {
  constructor(readonly svc: CredentialsService) {}

  @Get('/')
  async list() {
    return this.svc.list();
  }

  @Get('/:id')
  async find(request: CredentialsRequest.IdParam) {
    return this.svc.find(request.params.id);
  }

  @Post('/')
  async create(request: CredentialsRequest.Create) {
    return this.svc.create(request.body);
  }

  @Put('/:id')
  async update(request: CredentialsRequest.Update) {
    return this.svc.update(request.params.id, request.body);
  }

  @Delete('/:id')
  async delete(request: CredentialsRequest.IdParam) {
    return this.svc.remove(request.params.id);
  }
}

export default CredentialsController;
