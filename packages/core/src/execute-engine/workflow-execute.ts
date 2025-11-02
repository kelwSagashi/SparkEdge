import { ExecutionStatus, INodeData } from "nmg8-workflow";

interface Workflow {};

export class WorkflowExecute {
    private status: ExecutionStatus = 'new';
    private readonly abortController = new AbortController();
	timedOut: boolean = false;

    run(
        workflow: Workflow,
        startNode?: INodeData,
    ) {
        this.status = 'running';


    }
}