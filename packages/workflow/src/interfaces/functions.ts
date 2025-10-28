import { ContextType, IContextObject } from "./context";
import { ICredentialDataDecryptedObject } from "./credential";
import { ExecuteWorkflowData, IDataObject, IExecuteData, IExecuteResponsePromiseData, IRunExecutionData, ISourceData } from "./data";
import { ExecutionError, RelatedExecution } from "./execution";
import { ChunkType } from "./http";
import { Logger } from "./logs";
import { IGetNodeParameterOptions, INode, INodeExecutionData, INodeInputConfiguration, INodeOutputConfiguration, INodeParameters, INodeProperties, NodeConnectionType, NodeExecutionHint, NodeParameterValueType, NodeTypeAndVersion } from "./node";
import { Result } from "./result";
import { ITaskMetadata } from "./task";
import { IExecuteWorkflowInfo, IWorkflowMetadata, WorkflowActivateMode, WorkflowExecuteMode } from "./workflow";

export namespace ExecuteFunctions {
	namespace StringReturning {
		export type NodeParameter =
			| 'binaryProperty'
			| 'binaryPropertyName'
			| 'binaryPropertyOutput'
			| 'dataPropertyName'
			| 'dataBinaryProperty'
			| 'resource'
			| 'operation'
			| 'filePath'
			| 'encodingType';
	}

	namespace NumberReturning {
		export type NodeParameter = 'limit';
	}

	namespace BooleanReturning {
		export type NodeParameter =
			| 'binaryData'
			| 'download'
			| 'jsonParameters'
			| 'returnAll'
			| 'rawData'
			| 'resolveData';
	}

	namespace RecordReturning {
		export type NodeParameter = 'additionalFields' | 'filters' | 'options' | 'updateFields';
	}

	export type GetNodeParameterFn = {
		// @TECH_DEBT: Refactor to remove this barely used overload - N8N-5632
		getNodeParameter<T extends { resource: string }>(
			parameterName: 'resource',
			itemIndex?: number,
		): T['resource'];

		getNodeParameter(
			parameterName: StringReturning.NodeParameter,
			itemIndex: number,
			fallbackValue?: string,
			options?: IGetNodeParameterOptions,
		): string;
		getNodeParameter(
			parameterName: RecordReturning.NodeParameter,
			itemIndex: number,
			fallbackValue?: IDataObject,
			options?: IGetNodeParameterOptions,
		): IDataObject;
		getNodeParameter(
			parameterName: BooleanReturning.NodeParameter,
			itemIndex: number,
			fallbackValue?: boolean,
			options?: IGetNodeParameterOptions,
		): boolean;
		getNodeParameter(
			parameterName: NumberReturning.NodeParameter,
			itemIndex: number,
			fallbackValue?: number,
			options?: IGetNodeParameterOptions,
		): number;
		getNodeParameter(
			parameterName: string,
			itemIndex: number,
			fallbackValue?: any,
			options?: IGetNodeParameterOptions,
		): NodeParameterValueType | object;
	};
}

export interface FunctionsBase {
	logger: Logger;
	getCredentials<T extends object = ICredentialDataDecryptedObject>(
		type: string,
		itemIndex?: number,
	): Promise<T>;
	getCredentialsProperties(type: string): INodeProperties[];
	getExecutionId(): string;
	getNode(): INode;
	getWorkflow(): IWorkflowMetadata;
	getWorkflowStaticData(type: string): IDataObject;
	getTimezone(): string;
	getRestApiUrl(): string;
	getInstanceBaseUrl(): string;
	getInstanceId(): string;
	/** Get the waiting resume url signed with the signature token */
	getSignedResumeUrl(parameters?: Record<string, string>): string;
	/** Set requirement in the execution for signature token validation */
	setSignatureValidationRequired(): void;
	getChildNodes(
		nodeName: string,
		options?: { includeNodeParameters?: boolean },
	): NodeTypeAndVersion[];
	getParentNodes(
		nodeName: string,
		options?: {
			includeNodeParameters?: boolean;
			connectionType?: NodeConnectionType;
			depth?: number;
		},
	): NodeTypeAndVersion[];
	getKnownNodeTypes(): IDataObject;
	getMode?: () => WorkflowExecuteMode;
	getActivationMode?: () => WorkflowActivateMode;
	getChatTrigger: () => INode | null;
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
export type IExecuteFunctions = ExecuteFunctions.GetNodeParameterFn &
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

		// nodeHelpers: NodeHelperFunctions;

		// helpers: RequestHelperFunctions &
		// 	BaseHelperFunctions &
		// 	BinaryHelperFunctions &
		// 	DeduplicationHelperFunctions &
		// 	FileSystemHelperFunctions &
		// 	SSHTunnelFunctions &
		// 	DataTableProxyFunctions & {
		// 		normalizeItems(items: INodeExecutionData | INodeExecutionData[]): INodeExecutionData[];
		// 		constructExecutionMetaData(
		// 			inputData: INodeExecutionData[],
		// 			options: { itemData: IPairedItemData | IPairedItemData[] },
		// 		): NodeExecutionWithMetadata[];
		// 		assertBinaryData(itemIndex: number, parameterData: string | IBinaryData): IBinaryData;
		// 		getBinaryDataBuffer(
		// 			itemIndex: number,
		// 			parameterData: string | IBinaryData,
		// 		): Promise<Buffer>;
		// 		detectBinaryEncoding(buffer: Buffer): string;
		// 		copyInputItems(items: INodeExecutionData[], properties: string[]): IDataObject[];
		// 	};

		// getParentCallbackManager(): CallbackManager | undefined;

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


export type ISupplyDataFunctions = ExecuteFunctions.GetNodeParameterFn &
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

export type IWorkflowNodeContext = ExecuteFunctions.GetNodeParameterFn &
	Pick<FunctionsBase, 'getNode' | 'getWorkflow'>;
	
export interface ILocalLoadOptionsFunctions {
	getWorkflowNodeContext(nodeType: string): Promise<IWorkflowNodeContext | null>;
}