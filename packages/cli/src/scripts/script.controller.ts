import { Get, RestController } from "@nmg8/di";
import { DatabaseService, dbManager } from "nmg8-db";

@RestController('/scripts')
export class ScriptsController {
    repository: DatabaseService;
    constructor() {
        this.repository = dbManager;
    }

    @Get('/')
    async getScripts() {
        const scripts = this.repository.listSampleScripts();
        return {
            data: scripts.data
        }
    }
}