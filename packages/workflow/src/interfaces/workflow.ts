import { IConnections } from "./connection";
import { IDataObject, IPinData, IRunData, IRunExecutionData, StartNodeData } from "./data";
import { INodeData } from "./node";
import { ITaskData } from "./task";
import type * as express from 'express';

export interface IWorkflowMetadata {
	id?: string;
	name?: string;
	active: boolean;
}

export type WorkflowExecuteMode =
	| 'cli'
	| 'error'
	| 'integrated'
	| 'internal'
	| 'manual'
	| 'retry'
	| 'trigger'
	| 'webhook'
	| 'evaluation';

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
	timezone?: 'DEFAULT' | string;
	errorWorkflow?: string;
	callerIds?: string;
	callerPolicy?: WorkflowSettings.CallerPolicy;
	saveDataErrorExecution?: WorkflowSettings.SaveDataExecution;
	saveDataSuccessExecution?: WorkflowSettings.SaveDataExecution;
	saveManualExecutions?: 'DEFAULT' | boolean;
	saveExecutionProgress?: 'DEFAULT' | boolean;
	executionTimeout?: number;
	executionOrder?: 'v0' | 'v1';
	timeSavedPerExecution?: number;
	availableInMCP?: boolean;
}


export interface IWorkflowBase {
	id: string;
	name: string;
	active: boolean;
	isArchived: boolean;
	createdAt: Date;
	startedAt?: Date;
	updatedAt: Date;
	nodes: INodeData[];
	connections: IConnections;
	settings?: IWorkflowSettings;
	staticData?: IDataObject;
	pinData?: IPinData;
	versionId?: string;
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