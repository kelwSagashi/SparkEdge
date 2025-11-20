import { Service } from "@nmg8/di";
import { NodeTypes } from "./node-types";
import { IWorkflowBase, Workflow } from "nmg8-workflow";
import { WorkflowExecute } from "nmg8-core";

@Service()
export class WorkflowRunner {
    constructor(
        private readonly nodeTypes: NodeTypes,
    ) {}

    async runTest(workflow: IWorkflowBase, destinationNode?: string) {
        try { 
            const currentWorkflow = new Workflow({...workflow, nodeTypes: this.nodeTypes});
            const workflowExecute = new WorkflowExecute('manual', currentWorkflow);
            return await workflowExecute.run(destinationNode);
        } catch (error) {
            console.log('workflow-runner', error)
        }

        return;
    }
}