import { Delete, Get, Post, Put, RestController } from "@nmg8/di";
import { ScriptService } from "./script.service";
import ScriptRequest from "./script.request";

@RestController('/scripts')
export class ScriptsController {
    constructor(
        private readonly scriptService: ScriptService
    ) {}

    @Get('/sample/list')
    async listSamples() {
        const result = await this.scriptService.listSampleScripts();
        return { data: result.data, error: result.error };
    }

    @Get('/')
    async list() {
        const result = await this.scriptService.listAll();
        return { data: result.data, error: result.error };
    }

    @Get('/:id')
    async getOne(req: ScriptRequest.IdParam) {
        const result = await this.scriptService.findById(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Post('/')
    async create(req: ScriptRequest.Create) {
        const result = await this.scriptService.create(req.body);
        return { data: result.data, error: result.error };
    }

    @Put('/:id')
    async update(req: ScriptRequest.Update) {
        const values = { ...(req.body as Partial<ScriptRequest.Create["body"]>), id: req.params.id } as ScriptRequest.Create["body"];
        const result = await this.scriptService.upsert(values);
        return { data: result.data, error: result.error };
    }

    @Delete('/:id')
    async remove(req: ScriptRequest.IdParam) {
        const result = await this.scriptService.delete(req.params.id);
        return { data: result.data, error: result.error };
    }
}