import { INode, IEdge, IWorkflowSettings, IWorkflowBase, AuthenticatedRequest } from 'nmg8-workflow';

export declare namespace WorkflowRequest {
    type CreateUpdatePayload = {
		id?: string;
		name: string;
		nodes: INode[];
		edges: IEdge[];
		settings?: IWorkflowSettings;
		active: boolean;
		isAchived?: boolean;
	};

    type RunPayload = {
        workflow: IWorkflowBase;
        destinationNode?: string;
    }

    type Create = AuthenticatedRequest<{}, {}, CreateUpdatePayload>;

    type ManualRun = AuthenticatedRequest<{}, {}, RunPayload, {}>;
}