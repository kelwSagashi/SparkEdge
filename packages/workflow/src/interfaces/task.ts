import type { ISourceData } from "./data";
import type { ExecutionError, ExecutionStatus, RelatedExecution } from "./execution";
import type { INodeExecutionData, NodeExecutionHint, SubNodeExecutionDataAction } from "./node";

export interface ITaskStartedData {
	startTime: number;
	/** This index tracks the order in which nodes are executed */
	executionIndex: number;
	source: Array<ISourceData | null>; // Is an array as nodes have multiple inputs
	hints?: NodeExecutionHint[];
}

export interface ITaskData extends ITaskStartedData {
	executionTime: number;
	executionStatus?: ExecutionStatus;
	data?: ITaskDataConnections;
	inputOverride?: ITaskDataConnections;
	error?: ExecutionError;
	metadata?: ITaskMetadata;
}

export interface ITaskDataConnections {
	// Key for each input type and because there can be multiple inputs of the same type it is an array
	// null is also allowed because if we still need data for a later while executing the workflow set temporary to null
	// the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
	[key: string]: Array<INodeExecutionData[] | null>;
}

export interface ITaskSubRunMetadata {
	node: string;
	runIndex: number;
}

export interface ITaskMetadata {
	subRun?: ITaskSubRunMetadata[];
	parentExecution?: RelatedExecution;
	subExecution?: RelatedExecution;
	subExecutionsCount?: number;
	subNodeExecutionData?: {
		actions: SubNodeExecutionDataAction[];
		metadata: object;
	};
	/**
	 * When true, preserves sourceOverwrite information in pairedItem data during node execution.
	 * This is used for AI tool nodes to maintain correct expression resolution context, allowing
	 * tools to access data from nodes earlier in the workflow chain via $() expressions.
	 */
	preserveSourceOverwrite?: boolean;
}

export interface ITaskDataConnectionsSource {
	// Key for each input type and because there can be multiple inputs of the same type it is an array
	// null is also allowed because if we still need data for a later while executing the workflow set temporary to null
	// the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
	[key: string]: Array<ISourceData | null>;
}

export interface IWaitingForExecution {
	// Node name
	[key: string]: {
		// Run index
		[key: number]: ITaskDataConnections;
	};
}

export interface IWaitingForExecutionSource {
	// Node name
	[key: string]: {
		// Run index
		[key: number]: ITaskDataConnectionsSource;
	};
}