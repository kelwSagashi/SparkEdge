import { Delete, Get, Post, Put, RestController } from "@spark-edge/di";
import { DeviceService } from "./device.service";
import DeviceRequest from "./device.request";
import type { DeviceUpsertValues } from 'spark-edge-db';

@RestController('/devices')
export class DevicesController {
    constructor(
        private readonly deviceService: DeviceService
    ) {}

    @Get('/')
    async list() {
        const result = await this.deviceService.listAll();
        return { data: result.data, error: result.error };
    }

    @Get('/:id')
    async getOne(req: DeviceRequest.IdParam) {
        const result = await this.deviceService.findById(req.params.id);
        return { data: result.data, error: result.error };
    }

    @Post('/')
    async create(req: DeviceRequest.Create) {
        const payload: DeviceUpsertValues = req.body;
        const result = await this.deviceService.upsert(payload);
        return { data: result.data, error: result.error };
    }

    @Put('/:id')
    async update(req: DeviceRequest.Update) {
        const values: DeviceUpsertValues = { ...(req.body as Partial<DeviceUpsertValues>), id: req.params.id } as DeviceUpsertValues;
        const result = await this.deviceService.upsert(values);
        return { data: result.data, error: result.error };
    }

    @Delete('/:id')
    async remove(req: DeviceRequest.IdParam) {
        const result = await this.deviceService.delete(req.params.id);
        return { data: result.data, error: result.error };
    }
}
