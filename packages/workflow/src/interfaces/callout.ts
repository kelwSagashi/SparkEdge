export interface CalloutActionBase {
	type: string;
	label: string;
	icon?: string;
}

export interface CalloutActionOpenPreBuiltAgentsCollection extends CalloutActionBase {
	type: 'openPreBuiltAgentsCollection';
}

export interface CalloutActionOpenSampleWorkflowTemplate extends CalloutActionBase {
	type: 'openSampleWorkflowTemplate';
	templateId: string;
}

export type CalloutAction =
	| CalloutActionOpenPreBuiltAgentsCollection
	| CalloutActionOpenSampleWorkflowTemplate;