import { Post, Get, Put, Delete, RestController } from 'spark-edge-di';
import { CredentialsService } from './credentials.service';
import CredentialsRequest from './credentials.request';

@RestController('/credentials')
export class CredentialsController {
  constructor(readonly svc: CredentialsService) {}

  @Get('/config/meta')
  async getMeta() {
    return this.svc.getMeta();
  }

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

  @Post('/test')
  async test(request: { body: { auth_type_id: string, data: any } }) {
    return this.svc.testCredential(request.body.auth_type_id, request.body.data);
  }
}

