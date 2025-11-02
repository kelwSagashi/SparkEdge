import type { IContextObject } from "./context";
import type { ExecutionError, RelatedExecution } from "./execution";
import type { INodeData, INodeExecutionData } from "./node";
import type { ITaskData, ITaskDataConnections, ITaskDataConnectionsSource, ITaskMetadata, IWaitingForExecution, IWaitingForExecutionSource } from "./task";
import type { CloseFunction } from "./utils";
import type { IWorkflowExecutionDataProcess } from "./workflow";

export type GenericValue = string | object | number | boolean | undefined | null;

export interface IDataObject {
	[key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}


export interface ISourceData {
	previousNode: string;
	previousNodeOutput?: number; // If undefined "0" gets used
	previousNodeRun?: number; // If undefined "0" gets used
}

export interface IPinData {
	[nodeName: string]: INodeExecutionData[];
}

export interface IObservableObject {
	[key: string]: any;
	__dataChanged: boolean;
}

export type BinaryFileType = 'text' | 'json' | 'image' | 'audio' | 'video' | 'pdf' | 'html';
export interface IBinaryData {
	[key: string]: string | number | undefined;
	data: string;
	mimeType: string;
	fileType?: BinaryFileType;
	fileName?: string;
	directory?: string;
	fileExtension?: string;
	fileSize?: string; // TODO: change this to number and store the actual value
	id?: string;
}

export interface IBinaryKeyData {
	[key: string]: IBinaryData;
}

export interface IPairedItemData {
	item: number;
	input?: number; // If undefined "0" gets used
	sourceOverwrite?: ISourceData;
}

export interface ExecuteWorkflowData {
	executionId: string;
	data: Array<INodeExecutionData[] | null>;
	waitTill?: Date | null;
}

export interface StartNodeData {
	name: string;
	sourceData: ISourceData | null;
}

export interface IRunData {
	// node-name: result-data
	[key: string]: ITaskData[];
}

export interface IExecuteContextData {
	// Keys are: "flow" | "node:<NODE_NAME>"
	[key: string]: IContextObject;
}

export interface IExecuteData {
	data: ITaskDataConnections;
	metadata?: ITaskMetadata;
	node: INodeData;
	source: ITaskDataConnectionsSource | null;
	runIndex?: number;
}

export interface IRunExecutionData {
	startData?: {
		startNodes?: StartNodeData[];
		destinationNode?: string;
		originalDestinationNode?: string;
		runNodeFilter?: string[];
	};
	resultData: {
		error?: ExecutionError;
		runData: IRunData;
		pinData?: IPinData;
		lastNodeExecuted?: string;
		metadata?: Record<string, string>;
	};
	executionData?: {
		contextData: IExecuteContextData;
		nodeExecutionStack: IExecuteData[];
		metadata: {
			// node-name: metadata by runIndex
			[key: string]: ITaskMetadata[];
		};
		waitingExecution: IWaitingForExecution;
		waitingExecutionSource: IWaitingForExecutionSource| null;
	};
	parentExecution?: RelatedExecution;
	/**
	 * This is used to prevent breaking change
	 * for waiting executions started before signature validation was added
	 */
	validateSignature?: boolean;
	waitTill?: Date;
	pushRef?: string;

	/** Data needed for a worker to run a manual execution. */
	manualData?: Pick<
		IWorkflowExecutionDataProcess,
		'dirtyNodeNames' | 'triggerToStartFrom' | 'userId'
	>;
}

export type IExecuteResponsePromiseData = IDataObject | any;

export interface SupplyData {
	metadata?: IDataObject;
	response: unknown;
	closeFunction?: CloseFunction;
}