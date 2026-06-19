import { Delete, Get, Post, Put, RestController } from "spark-edge-di";
import { InstanceService } from "./instance.service";
import InstanceRequest from "./instance.request";
import { InstanceRunnerService } from "./instance-runner.service";
import { dbManager } from "spark-edge-db";

@RestController('/instances')
export class InstanceController {
    constructor(
        private readonly instanceService: InstanceService,
        private readonly instanceRunner: InstanceRunnerService
    ) {}

    @Get('/')
    async list() {
        const result = await this.instanceService.listAll();
        return { data: result.data, error: result.error };
    }

    @Get('/active')
    async listActive() {
        const result = await this.instanceService.listActive();
        return { data: result.data, error: result.error };
    }

    @Get('/project/:project_id')
    async listByProject(req: InstanceRequest.ListByProject) {
        const result = await this.instanceService.listByProject(req.params.project_id);
        return { data: result.data, error: result.error };
    }

    @Get('/:id')
    async getOne(req: InstanceRequest.IdParam) {
        const result = await this.instanceService.getWithDestinations(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Post('/')
    async create(req: InstanceRequest.Create) {
        const result = await this.instanceService.create(req.body);
        return { data: result.data, error: result.error };
    }

    @Put('/:id')
    async update(req: InstanceRequest.Update) {
        const result = await this.instanceService.update(req.params.id, req.body);
        return { data: result.data, error: result.error };
    }

    @Delete('/:id')
    async remove(req: InstanceRequest.IdParam) {
        const result = await this.instanceService.delete(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Post('/:id/trigger')
    async triggerManual(req: InstanceRequest.TriggerManual) {
        const result = await this.instanceRunner.triggerManual(req.params.id);
        return { data: result };
    }

    @Get('/:id/executions')
    async listExecutions(req: InstanceRequest.IdParam) {
        const result = dbManager.instanceExecutions.listByInstance(req.params.id);
        return { data: result.data, error: result.error };
    }
}

