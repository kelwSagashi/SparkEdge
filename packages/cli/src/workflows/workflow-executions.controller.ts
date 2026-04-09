import { Post, Get, Put, Delete, RestController, Body, Param } from '@nmg8/di';
import { WorkflowExecutionsService } from './workflow-executions.service';
import type WorkflowExecutionsRequest from './workflow-executions.request';

@RestController('/workflow-executions')
export class WorkflowExecutionsController {
  constructor(readonly svc: WorkflowExecutionsService) {}

  @Get('/')
  async list() {
    return this.svc.list();
  }

  @Get('/workflow/:id')
  async listByWorkflow(req: WorkflowExecutionsRequest.IdParam) {
    return this.svc.listByWorkflow(req.params.id);
  }

  @Get('/:id')
  async find(request: WorkflowExecutionsRequest.IdParam) {
    return this.svc.find(request.params.id);
  }

  @Post('/')
  async create(request: WorkflowExecutionsRequest.Create) {
    return this.svc.create(request.body);
  }

  @Put('/:id')
  async update(request: WorkflowExecutionsRequest.Update) {
    return this.svc.update(request.params.id, request.body);
  }

  @Post('/:id/trigger')
  async trigger(request: WorkflowExecutionsRequest.IdParam) {
    return this.svc.trigger(request.params.id);
  }

  @Put('/:id/enable')
  async enable(req: WorkflowExecutionsRequest.IdParamEnable) {
    const enabled = req.params.enabled ? true : false;
    return this.svc.setEnabled(req.params.id, enabled);
  }

  @Delete('/:id')
  async delete(request: WorkflowExecutionsRequest.IdParam) {
    return this.svc.remove(request.params.id);
  }
}

export default WorkflowExecutionsController;
