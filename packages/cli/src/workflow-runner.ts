import { Service } from "@nmg8/di";
import { NodeTypes } from "./node-types";
import { IWorkflowBase, IWorkflowExecutionDataProcess, Workflow, WorkflowTest } from "nmg8-workflow";
import { WorkflowExecute } from "nmg8-core";

@Service()
export class WorkflowRunner {
    constructor(
        private readonly nodeTypes: NodeTypes,
    ) {}

    run(
        data: IWorkflowExecutionDataProcess
    ) {
        const {} = data.workflowData;
    }

    async runTest(workflow: IWorkflowBase, destinationNode?: string) {
        try { 
            const currentWorkflow = new Workflow(workflow);
            const workflowExecute = new WorkflowExecute('manual');
            return workflowExecute.run(currentWorkflow, destinationNode);
        } catch (error) {
            console.log('workflow-runner', error)
        }

        return;
    }
}