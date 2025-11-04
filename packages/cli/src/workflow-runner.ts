import { Service } from "@nmg8/di";
import { NodeTypes } from "./node-types";
import { IWorkflowExecutionDataProcess } from "nmg8-workflow";

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
}