import { Get, RestController } from "@nmg8/di";
import { DatabaseService, dbManager } from "nmg8-db";

@RestController('/devices')
export class DevicesController {
    repository: DatabaseService;
    constructor() {
        this.repository = dbManager;
    }


    @Get('/')
    async getDevices() {
        
        const devices = await this.repository.listMockDevices();
        return {
            data: devices.data
        }
    }
}