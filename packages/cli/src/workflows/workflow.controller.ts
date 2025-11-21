import { Body, Post, RestController } from "@nmg8/di";
import { WorkflowService } from "./workflow.service";
import { INode, IWorkflowBase } from "nmg8-workflow";
import { WorkflowRequest } from "./workflow.request";
import { WorkflowEntity } from 'nmg8-db/src/types';
import { dbManager } from 'nmg8-db';
import { Logger } from "@/simple-logger";
import { Response } from "express";

@RestController('/workflows')
export class WorkflowController {
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly logger: Logger
    ) {}

    @Post('/')
    async create(req: WorkflowRequest.Create) {
        // const newWorkflow = new WorkflowEntity({
        //     name: req.body.name,
        //     active: req.body.active,
        //     edges: req.body.edges,
        //     nodes: req.body.nodes,
        //     id: req.body.id,
        //     isArchived: req.body.isAchived,
        //     settings: req.body.settings ?? {}
        // });

        // const savedWorkflow = dbManager.upsertWorkflow(newWorkflow);

        // if (!savedWorkflow) {
		// 	this.logger.log('Failed to create workflow');
		// 	throw new Error('Failed to save workflow');
		// }
    }

    @Post('/run/test')
    async runTest(
        req: WorkflowRequest.ManualRun,
        res: Response
    ) {
        return await this.workflowService.runTest(
            req.body.workflow,
            req.body.destinationNode
        );
    }
}