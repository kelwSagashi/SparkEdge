import type { ContextType, IContextObject } from "./context";
import type { ExecuteWorkflowData, IDataObject, IExecuteData, IExecuteResponsePromiseData, IRunExecutionData, ISourceData } from "./data";
import type { ExecutionError, RelatedExecution } from "./execution";
import type { ChunkType } from "./http";
import type { IGetNodeParameterOptions, INode, INodeData, INodeTypeExecutionContext, INodeExecutionData, INodeInputConfiguration, INodeOutputConfiguration, INodeParameters, INodeProperties, NodeConnectionType, NodeExecutionHint, NodeParameterValueType, NodeTypeAndVersion } from "./node";
import type { Result } from "./result";
import type { ITaskMetadata } from "./task";
import type { IExecuteWorkflowInfo, IWorkflowMetadata, WorkflowActivateMode, WorkflowExecuteMode } from "./workflow";

export namespace ExecuteFunctions {
	export type GetNodeInstances = {
		nodeContext: INodeTypeExecutionContext
	};
}

export interface FunctionsBase {
	// logger: Logger;
	// getCredentials<T extends object = ICredentialDataDecryptedObject>(
	// 	type: string,
	// 	itemIndex?: number,
	// ): Promise<T>;
	// getCredentialsProperties(type: string): INodeProperties[];
	getExecutionId(): string;
	getNode(): INode;
	getWorkflow(): IWorkflowMetadata;
	getWorkflowStaticData(type: string): IDataObject;
	// getTimezone(): string;
	// getRestApiUrl(): string;
	// getInstanceBaseUrl(): string;
	// getInstanceId(): string;
	/** Get the waiting resume url signed with the signature token */
	// getSignedResumeUrl(parameters?: Record<string, string>): string;
	/** Set requirement in the execution for signature token validation */
	// setSignatureValidationRequired(): void;
	// getChildNodes(
	// 	nodeName: string,
	// 	options?: { includeNodeParameters?: boolean },
	// ): NodeTypeAndVersion[];
	// getParentNodes(
	// 	nodeName: string,
	// 	options?: {
	// 		includeNodeParameters?: boolean;
	// 		connectionType?: NodeConnectionType;
	// 		depth?: number;
	// 	},
	// ): NodeTypeAndVersion[];
	// getKnownNodeTypes(): IDataObject;
	getMode?: () => WorkflowExecuteMode;
	getActivationMode?: () => WorkflowActivateMode;
	// getChatTrigger: () => INodeData | null;
	prepareOutputData(outputData: INodeExecutionData[]): Promise<INodeExecutionData[][]>;
}

export type FunctionsBaseWithRequiredKeys<Keys extends keyof FunctionsBase> = FunctionsBase & {
	[K in Keys]: NonNullable<FunctionsBase[K]>;
};

export type BaseExecutionFunctions = FunctionsBaseWithRequiredKeys<'getMode'> & {
	continueOnFail(): boolean;
	setMetadata(metadata: ITaskMetadata): void;
	evaluateExpression(expression: string, itemIndex: number): NodeParameterValueType;
	getContext(type: ContextType): IContextObject;
	getExecuteData(): IExecuteData;
	getInputSourceData(inputIndex?: number, connectionType?: NodeConnectionType): ISourceData;
	getExecutionCancelSignal(): AbortSignal | undefined;
	onExecutionCancellation(handler: () => unknown): void;
};

// TODO: Create later own type only for Config-Nodes
export type IExecuteFunctions = ExecuteFunctions.GetNodeInstances &
	BaseExecutionFunctions & {
		executeWorkflow(
			workflowInfo: IExecuteWorkflowInfo,
			inputData?: INodeExecutionData[],
			// parentCallbackManager?: CallbackManager,
			options?: {
				doNotWaitToFinish?: boolean;
				parentExecution?: RelatedExecution;
			},
		): Promise<ExecuteWorkflowData>;
		getExecutionDataById(executionId: string): Promise<IRunExecutionData | undefined>;
		// getInputConnectionData(
		// 	connectionType: AINodeConnectionType,
		// 	itemIndex: number,
		// 	inputIndex?: number,
		// ): Promise<unknown>;
		getInputData(inputIndex?: number, connectionType?: NodeConnectionType): INodeExecutionData[];
		getNodeInputs(): INodeInputConfiguration[];
		getNodeOutputs(): INodeOutputConfiguration[];
		putExecutionToWait(waitTill: Date): Promise<void>;
		sendMessageToUI(message: any): void;
		sendResponse(response: IExecuteResponsePromiseData): void;
		sendChunk(type: ChunkType, itemIndex: number, content?: IDataObject | string): void;
		isStreaming(): boolean;

		// TODO: Make this one then only available in the new config one
		addInputData(
			connectionType: NodeConnectionType,
			data: INodeExecutionData[][] | ExecutionError,
			runIndex?: number,
		): { index: number };
		addOutputData(
			connectionType: NodeConnectionType,
			currentNodeRunIndex: number,
			data: INodeExecutionData[][] | ExecutionError,
			metadata?: ITaskMetadata,
			sourceNodeRunIndex?: number,
		): void;

		addExecutionHints(...hints: NodeExecutionHint[]): void;
		startJob<T = unknown, E = unknown>(
			jobType: string,
			settings: unknown,
			itemIndex: number,
		): Promise<Result<T, E>>;
	};

export interface IExecuteSingleFunctions extends BaseExecutionFunctions {
	getInputData(inputIndex?: number, connectionType?: NodeConnectionType): INodeExecutionData;
	getItemIndex(): number;
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;

	// helpers: RequestHelperFunctions &
	// 	BaseHelperFunctions &
	// 	BinaryHelperFunctions & {
	// 		assertBinaryData(propertyName: string, inputIndex?: number): IBinaryData;
	// 		getBinaryDataBuffer(propertyName: string, inputIndex?: number): Promise<Buffer>;
	// 		detectBinaryEncoding(buffer: Buffer): string;
	// 	};
}


export type ISupplyDataFunctions = ExecuteFunctions.GetNodeInstances &
	FunctionsBaseWithRequiredKeys<'getMode'> &
	Pick<
		IExecuteFunctions,
		| 'addInputData'
		| 'addOutputData'
		| 'getInputData'
		| 'getNodeOutputs'
		| 'executeWorkflow'
		| 'sendMessageToUI'
		| 'startJob'
	> & {
		getNextRunIndex(): number;
		continueOnFail(): boolean;
		evaluateExpression(expression: string, itemIndex: number): NodeParameterValueType;
		// getWorkflowDataProxy(itemIndex: number): IWorkflowDataProxyData;
		getExecutionCancelSignal(): AbortSignal | undefined;
		onExecutionCancellation(handler: () => unknown): void;
		cloneWith(replacements: {
			runIndex: number;
			inputData: INodeExecutionData[][];
		}): ISupplyDataFunctions;
	};

export interface ILoadOptionsFunctions extends FunctionsBase {
	getNodeParameter(
		parameterName: string,
		fallbackValue?: any,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object;
	getCurrentNodeParameter(
		parameterName: string,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType | object | undefined;
	getCurrentNodeParameters(): INodeParameters | undefined;

	// helpers: RequestHelperFunctions & SSHTunnelFunctions & DataTableProxyFunctions;
}

export type IWorkflowNodeContext = ExecuteFunctions.GetNodeInstances &
	Pick<FunctionsBase, 'getNode' | 'getWorkflow'>;
	
export interface ILocalLoadOptionsFunctions {
	getWorkflowNodeContext(nodeType: string): Promise<IWorkflowNodeContext | null>;
}