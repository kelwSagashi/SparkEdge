import { ExecutionStatus, INode, INodeData, Workflow } from "nmg8-workflow";

type WorkflowModeExecution = 'selected' | 'all';
export class WorkflowExecute {
    private status: ExecutionStatus;
    private readonly abortController = new AbortController();
	timedOut: boolean = false;
    mode: WorkflowModeExecution;

    private workflow: Workflow;

    

    constructor( 
        workflow: Workflow,
        mode: WorkflowModeExecution,
        startNode?: INodeData
    ) {
        this.mode = mode;
        this.status = 'new';

        this.workflow = workflow;

        if (mode === 'selected') {
            this.workflow = workflow.getOnlySelected();
        }
    }

    run() {
        this.status = 'running';

        
        for (const nodeId in this.workflow.buildGraph()) {
            const node = this.workflow.nodes.find(n => n.id === nodeId);
            
            if (!node) continue;

            this.executeNode(node);
        }
    }

    executeNode(node: INode) {

    }
}