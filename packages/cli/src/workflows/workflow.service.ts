import { WorkflowRunner } from "@/workflow-runner";
import { Service } from "@nmg8/di";
import { IWorkflowBase } from "nmg8-workflow";

@Service()
export class WorkflowService {
    constructor(
        private readonly workflowRunner: WorkflowRunner,
    ) {}

    async runTest(workflow: IWorkflowBase, destinationNode?: string) {
        return await this.workflowRunner.runTest(workflow, destinationNode)
    }
}