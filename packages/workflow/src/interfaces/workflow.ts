import type { Workflow } from "../workflow";
import type { IConnections } from "./connection";
import type { ExecuteWorkflowData, IDataObject, IExecuteData, IPinData, IRunData, IRunExecutionData, StartNodeData } from "./data";
import type { IEdge } from "./edge";
import type { ExecutionStatus, RelatedExecution } from "./execution";
import type { IExecuteFunctions } from "./functions";
import type { INode, INodeData, INodeExecutionData, INodeParameters, INodeTypes } from "./node";
import type { Result } from "./result";
import type { ITaskData, ITaskDataConnections } from "./task";
import type * as express from 'express';

export interface IWorkflowMetadata {
	id?: string;
	name?: string;
	active: boolean;
}

export const WorkflowExecuteModeValues = [
	'cli',
	'error',
	'integrated',
	'internal',
	'manual',
	'retry',
	'trigger',
	'webhook',
	'evaluation'
] as const;

export type WorkflowExecuteMode = (typeof WorkflowExecuteModeValues)[keyof typeof WorkflowExecuteModeValues];

export type WorkflowActivateMode =
	| 'init'
	| 'create' // unused
	| 'update'
	| 'activate'
	| 'manual' // unused
	| 'leadershipChange';


export interface IExecuteWorkflowInfo {
	code?: IWorkflowBase;
	id?: string;
}

export namespace WorkflowSettings {
	export type CallerPolicy = 'any' | 'none' | 'workflowsFromAList' | 'workflowsFromSameOwner';
	export type SaveDataExecution = 'DEFAULT' | 'all' | 'none';
}

export interface IWorkflowSettings {
}


export type IWorkflowBase<Nodes = INode[], Edges = IEdge[]> = {
	id: string;
	name: string;
	nodes: Nodes;
	edges: Edges;
	active?: boolean;
	isArchived?: boolean;
	settings?: IWorkflowSettings;
}

export interface IWorkflowExecutionDataProcess {
	destinationNode?: string;
	restartExecutionId?: string;
	executionMode: WorkflowExecuteMode;
	/**
	 * The data that is sent in the body of the webhook that started this
	 * execution.
	 */
	executionData?: IRunExecutionData;
	runData?: IRunData;
	pinData?: IPinData;
	retryOf?: string | null;
	pushRef?: string;
	startNodes?: StartNodeData[];
	workflowData: IWorkflowBase;
	userId?: string;
	projectId?: string;
	dirtyNodeNames?: string[];
	triggerToStartFrom?: {
		name: string;
		data?: ITaskData;
	};
	httpResponse?: express.Response; // Used for streaming responses
	streamingEnabled?: boolean;
	startedAt?: Date;
}

export interface ExecuteWorkflowOptions {
	node?: INode;
	parentWorkflowId: string;
	inputData?: INodeExecutionData[];
	loadedWorkflowData?: IWorkflowBase;
	loadedRunData?: IWorkflowExecutionDataProcess;
	parentWorkflowSettings?: IWorkflowSettings;
	// parentCallbackManager?: CallbackManager;
	doNotWaitToFinish?: boolean;
	parentExecution?: RelatedExecution;
}

export interface IWorkflowExecuteAdditionalData {
	executeWorkflow: (
		workflowInfo: IExecuteWorkflowInfo,
		additionalData: IWorkflowExecuteAdditionalData,
		options: ExecuteWorkflowOptions,
	) => Promise<ExecuteWorkflowData>;
	getRunExecutionData: (executionId: string) => Promise<IRunExecutionData | undefined>;
	executionId?: string;
	restartExecutionId?: string;
	currentNodeExecutionIndex: number;
	httpResponse?: express.Response;
	httpRequest?: express.Request;
	streamingEnabled?: boolean;
	restApiUrl: string;
	instanceBaseUrl: string;
	setExecutionStatus?: (status: ExecutionStatus) => void;
	sendDataToUI?: (type: string, data: IDataObject | IDataObject[]) => void;
	formWaitingBaseUrl: string;
	webhookBaseUrl: string;
	webhookWaitingBaseUrl: string;
	webhookTestBaseUrl: string;
	currentNodeParameters?: INodeParameters;
	executionTimeoutTimestamp?: number;
	userId?: string;
	variables: IDataObject;
	// parentCallbackManager?: CallbackManager;
	startRunnerTask<T, E = unknown>(
		additionalData: IWorkflowExecuteAdditionalData,
		jobType: string,
		settings: unknown,
		executeFunctions: IExecuteFunctions,
		inputData: ITaskDataConnections,
		node: INode,
		workflow: Workflow,
		runExecutionData: IRunExecutionData,
		runIndex: number,
		itemIndex: number,
		activeNodeName: string,
		connectionInputData: INodeExecutionData[],
		siblingParameters: INodeParameters,
		mode: WorkflowExecuteMode,
		// envProviderState: EnvProviderState,
		executeData?: IExecuteData,
	): Promise<Result<T, E>>;
}