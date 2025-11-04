import { BuilderNodeTypes, NodeConnectionTypes, NodeGroupTypes } from "../constants";
import { GenericError } from "../errors/generic-error";
import { Icon, Themed, ThemeIconColor } from "./icon";
import { EngineRequest, EngineResponse } from "./engine";
import { GenericValue, IBinaryKeyData, IDataObject, IPairedItemData, SupplyData } from "./data";
import { RelatedExecution } from "./execution";
import { ITriggerFunctions, ITriggerResponse, TriggerPanelDefinition } from "./trigger";
import { PostReceiveAction } from "./post";
import { IHttpRequestOptions, PreSendAction } from "./http";
import { IExecuteFunctions, IExecuteSingleFunctions, ILoadOptionsFunctions, ILocalLoadOptionsFunctions, ISupplyDataFunctions } from "./functions";
import { ICredentialsDisplayOptions, IDisplayOptions } from "./display";
import { FilterTypeOptions, FilterValue } from "./filter";
import { AssignmentCollectionValue, AssignmentTypeOptions } from "./assignment";
import { CalloutAction } from "./callout";
import { FieldType } from "./field";
import { EnsureTypeOptions, ExpressionString, Optional } from "./utils";
import { DeclarativeRestApiSettings } from "./restapi";
import { ICredentialTestFunction } from "./credential";
import { ResourceMapperFields, ResourceMapperValue } from "./resource-mapper";
import { IHandle } from "./edge";

export type NodeGroupType = (typeof NodeGroupTypes)[keyof typeof NodeGroupTypes];

export interface INodeTypeBaseDescription {
	type: BuilderNodeTypes;
	displayName: string;
	name: string;
	icon?: Icon;
	iconColor?: ThemeIconColor;
	iconUrl?: Themed<string>;
	badgeIconUrl?: Themed<string>;
	group: NodeGroupType;
	description: string;
	documentationUrl?: string;
	subtitle?: string;
	defaultVersion?: number;
}

export type NodeDefaults = {
	name?: string;
	handleActions?: true;
	
};

export interface INodeInputFilter {
	nodes?: string[]; // Allowed nodes
	excludedNodes?: string[];
}

export type NodeConnectionType = (typeof NodeConnectionTypes)[keyof typeof NodeConnectionTypes];

export type INodeOutputConfigurationCategories = 'error' | 'stdout' | 'stderr' | 'success';

export enum INodeIOPosition {
    Left = "left",
    Top = "top",
    Right = "right",
    Bottom = "bottom"
}

export interface INodeOutputConfiguration {
	id: string;
	category?: INodeOutputConfigurationCategories;
	displayName?: string;
	maxConnections?: number;
	required?: boolean;
	type: NodeConnectionType;
	position: INodeIOPosition;
}

export interface INodeInputConfiguration {
	id: string;
	category?: string;
	displayName?: string;
	required?: boolean;
	type: NodeConnectionType;
	position: INodeIOPosition;
	// filter?: INodeInputFilter;
	maxConnections?: number;
}

export interface INodePropertyModeTypeOptions {
	searchListMethod?: string; // Supported by: options
	searchFilterRequired?: boolean;
	searchable?: boolean;
	/**
	 * If true, the resource locator will not show an error if the credentials are not selected
	 */
	skipCredentialsCheckInRLC?: boolean;
	allowNewResource?: {
		label: string;
	} & (
		| { method: string; url?: never; defaultName: string }
		| { method?: never; url: string; defaultName?: never }
	);
}

export interface INodePropertyRouting {

	// operations?: IN8nRequestOperations; // Should be changed, does not sound right
	// output?: INodeRequestOutput;
	request?: DeclarativeRestApiSettings.HttpRequestOptions;
	// send?: INodeRequestSend;
}

export interface INodeRequestOutput {
	maxResults?: number | string;
	postReceive?: PostReceiveAction[];
}

export interface INodeRequestSend {
	preSend?: PreSendAction[];
	paginate?: boolean | string; // Where should this life?
	property?: string; // Maybe: propertyName, destinationProperty?
	propertyInDotNotation?: boolean; // Enabled by default
	type?: 'body' | 'query';
	value?: string;
}

export interface INodeRequestOutput {
	maxResults?: number | string;
	postReceive?: PostReceiveAction[];
}

export interface INodePropertyMode {
	displayName: string;
	name: string;
	type: 'string' | 'list';
	hint?: string;
	validation?: Array<
		INodePropertyModeValidation | { (this: IExecuteSingleFunctions, value: string): void }
	>;
	placeholder?: string;
	url?: string;
	// extractValue?: INodePropertyValueExtractor;
	initType?: string;
	entryTypes?: {
		[name: string]: {
			selectable?: boolean;
			hidden?: boolean;
			queryable?: boolean;
			data?: {
				request?: IHttpRequestOptions;
				output?: INodeRequestOutput;
			};
		};
	};
	search?: INodePropertyRouting;
	typeOptions?: INodePropertyModeTypeOptions;
}

export interface INodePropertyModeValidation {
	type: string;
	properties: {};
}

export interface INodePropertyRegexValidation extends INodePropertyModeValidation {
	type: 'regex';
	properties: {
		regex: string;
		errorMessage: string;
	};
}

export interface INodePropertyOptions {
	name: string;
	value: string | number | boolean;
	action?: string;
	description?: string;
	routing?: INodePropertyRouting;
	outputConnectionType?: NodeConnectionType;
	inputSchema?: any;
	displayOptions?: IDisplayOptions;
	// disabledOptions added for compatibility with INodeProperties and INodeCredentialDescription types
	// it needs to be implemented, if needed
	disabledOptions?: undefined;
}

export interface INodePropertyCollection {
	displayName: string;
	name: string;
	values: INodeProperties[];
}

export type NodePropertyTypes =
	| 'boolean'
	| 'button'
	| 'collection'
	| 'color'
	| 'dateTime'
	| 'fixedCollection'
	| 'hidden'
	| 'json'
	| 'callout'
	| 'notice'
	| 'multiOptions'
	| 'number'
	| 'options'
	| 'string'
	| 'credentialsSelect'
	| 'resourceLocator'
	| 'curlImport'
	| 'resourceMapper'
	| 'filter'
	| 'assignmentCollection'
	| 'credentials'
	| 'workflowSelector'
	| 'scriptSelector'
	| 'deviceSelector';

export type NodePropertyAction = {
	type: 'askAiCodeGeneration';
	handler?: string;
	target?: string;
};

export interface ResourceMapperTypeOptionsBase {
	mode: 'add' | 'update' | 'upsert' | 'map';
	valuesLabel?: string;
	fieldWords?: {
		singular: string;
		plural: string;
	};
	addAllFields?: boolean;
	noFieldsError?: string;
	multiKeyMatch?: boolean;
	supportAutoMap?: boolean;
	hideNoDataError?: boolean; // Hide "No data found" error when no fields are available
	matchingFieldsLabels?: {
		title?: string;
		description?: string;
		hint?: string;
	};
	showTypeConversionOptions?: boolean;
	allowEmptyValues?: boolean;
}

// Enforce at least one of resourceMapperMethod or localResourceMapperMethod
export type ResourceMapperTypeOptionsLocal = {
	resourceMapperMethod: string;
	localResourceMapperMethod?: never; // Explicitly disallows this property
};

export type ResourceMapperTypeOptionsExternal = {
	localResourceMapperMethod: string;
	resourceMapperMethod?: never; // Explicitly disallows this property
};

export type ResourceMapperTypeOptions = ResourceMapperTypeOptionsBase &
	(ResourceMapperTypeOptionsLocal | ResourceMapperTypeOptionsExternal);


export interface INodePropertyTypeOptions {
	// Supported by: button
	buttonConfig?: {
		action?: string | NodePropertyAction;
		label?: string; // otherwise "displayName" is used
		hasInputField?: boolean;
		inputFieldMaxLength?: number; // Supported if hasInputField is true
	};
	containerClass?: string; // Supported by: notice
	alwaysOpenEditWindow?: boolean; // Supported by: json
	// codeAutocomplete?: CodeAutocompleteTypes; // Supported by: string
	// editor?: EditorType; // Supported by: string
	// editorIsReadOnly?: boolean; // Supported by: string
	// sqlDialect?: SQLDialect; // Supported by: sqlEditor
	loadOptionsDependsOn?: string[]; // Supported by: options
	loadOptionsMethod?: string; // Supported by: options
	// loadOptions?: ILoadOptions; // Supported by: options
	maxValue?: number; // Supported by: number
	minValue?: number; // Supported by: number
	multipleValues?: boolean; // Supported by: <All>
	multipleValueButtonText?: string; // Supported when "multipleValues" set to true
	numberPrecision?: number; // Supported by: number
	password?: boolean; // Supported by: string
	rows?: number; // Supported by: string
	showAlpha?: boolean; // Supported by: color
	sortable?: boolean; // Supported when "multipleValues" set to true
	expirable?: boolean; // Supported by: hidden (only in the credentials)
	resourceMapper?: ResourceMapperTypeOptions;
	filter?: FilterTypeOptions;
	assignment?: AssignmentTypeOptions;
	minRequiredFields?: number; // Supported by: fixedCollection
	maxAllowedFields?: number; // Supported by: fixedCollection
	calloutAction?: CalloutAction; // Supported by: callout
	binaryDataProperty?: boolean; // Indicate that the property expects binary data
	[key: string]: any;
}

export type NodeParameterValue = string | number | boolean | undefined | null;

export type ResourceLocatorModes = 'id' | 'url' | 'list' | string;

export interface IResourceLocatorResult {
	name: string;
	value: string;
	url?: string;
}

export interface INodeParameterResourceLocator {
	__rl: true;
	mode: ResourceLocatorModes;
	value: Exclude<NodeParameterValue, boolean>;
	cachedResultName?: string;
	cachedResultUrl?: string;
	__regex?: string;
}

export type NodeParameterValueType =
	| NodeParameterValue
	| INodeParameters
	| INodeParameterResourceLocator
	| ResourceMapperValue
	| FilterValue
	| AssignmentCollectionValue
	| NodeParameterValue[]
	| INodeParameters[]
	| INodeParameterResourceLocator[]
	| ResourceMapperValue[];

export interface INodeParameters {
	[key: string]: NodeParameterValueType;
}

export interface INodeProperties {
	displayName: string;
	name: string;
	type: NodePropertyTypes;
	typeOptions?: INodePropertyTypeOptions;
	default?: NodeParameterValueType;
	description?: string;
	hint?: string;
	disabledOptions?: IDisplayOptions;
	displayOptions?: IDisplayOptions;
	options?: Array<INodePropertyOptions | INodeProperties | INodePropertyCollection>;
	placeholder?: string;
	isNodeSetting?: boolean;
	noDataExpression?: boolean;
	required?: true;
	routing?: INodePropertyRouting;
	credentialTypes?: Array<
		'extends:oAuth2Api' | 'extends:oAuth1Api' | 'has:authenticate' | 'has:genericAuth'
	>;
	// extractValue?: INodePropertyValueExtractor;
	modes?: INodePropertyMode[];
	requiresDataPath?: 'single' | 'multiple';
	doNotInherit?: boolean;
	// set expected type for the value which would be used for validation and type casting
	validateType?: FieldType;
	// works only if validateType is set
	// allows to skip validation during execution or set custom validation/casting logic inside node
	// inline error messages would still be shown in UI
	ignoreValidationDuringExecution?: boolean;
	// for type: options | multiOptions – skip validation of the value (e.g. when value is not in the list and specified via expression)
	allowArbitraryValues?: boolean;
}

export interface IGetNodeParameterOptions {
	contextNode?: INodeData;
	// make sure that returned value would be of specified type, converts it if needed
	ensureType?: EnsureTypeOptions;
	// extract value from regex, works only when parameter type is resourceLocator
	extractValue?: boolean;
	// get raw value of parameter with unresolved expressions
	rawExpressions?: boolean;
	// skip validation of parameter
	skipValidation?: boolean;
}

export type NodeTypeAndVersion = {
	name: string;
	type: string;
	typeVersion: number;
	disabled: boolean;
	parameters?: INodeParameters;
};

export type SubNodeExecutionDataAction = {
	nodeName: string;
	runIndex: number;
	action: EngineRequest['actions'][number];
	response?: object;
};

export interface INodeCredentialsDetails {
	id: string | null;
	name: string;
}

export interface INodeCredentials {
	[key: string]: INodeCredentialsDetails;
}

export type OnError = 'continueErrorOutput' | 'continueRegularOutput' | 'stopWorkflow';


export interface INodeData extends Record<string, unknown> {
	name: string;
	version?: string | number | number[];
	type: BuilderNodeTypes;
    group: NodeGroupType;
	disabled?: boolean;
	notes?: string;
	notesInFlow?: boolean;
	retryOnFail?: boolean;
	maxTries?: number;
	waitBetweenTries?: number;
	alwaysOutputData?: boolean;
	executeOnce?: boolean;
	onError?: OnError;
	continueOnFail?: boolean;
	parameters: INodeParameters;
	credentials?: INodeCredentials;
	webhookId?: string;

    inputNames?: string[];
	inputs: Array<INodeInputConfiguration> | ExpressionString;
	outputs: Array<INodeOutputConfiguration> | ExpressionString;
	outputNames?: string[];
	requiredInputs?: string | number[] | number;
    // parameters: IBaseNodeTypeDescription;
}

export interface INodes {
	[key: string]: INodeData;
}
export interface INodeExecutionData {
	[key: string]:
		| IDataObject
		| IBinaryKeyData
		| IPairedItemData
		| IPairedItemData[]
		// | NodeApiError
		// | NodeOperationError
		| GenericError
		| number
		| string
		| undefined;

	json: IDataObject;
	binary?: IBinaryKeyData;
	error?: GenericError;
	pairedItem?: IPairedItemData | IPairedItemData[] | number;
	metadata?: {
		subExecution: RelatedExecution;
	};
	evaluationData?: Record<string, GenericValue>;
}

export interface INodeCredentialDescription {
	name: string;
	required?: boolean;
	displayName?: string;
	disabledOptions?: ICredentialsDisplayOptions;
	displayOptions?: ICredentialsDisplayOptions;
	testedBy?: string;
}

export interface INodeTypeDescription extends INodeTypeBaseDescription {
	version: number | number[] | string;
	defaults: NodeDefaults;
	eventTriggerDescription?: string;
	activationMessage?: string;
	
	inputNames?: string[];
	inputs: Array<INodeInputConfiguration> | ExpressionString;
	outputs: Array<INodeOutputConfiguration> | ExpressionString;
	outputNames?: string[];
	requiredInputs?: string | number[] | number;

	properties: INodeProperties[];
	credentials?: INodeCredentialDescription[];
	// maxNodes?: number; // How many nodes of that type can be created in a workflow
	// polling?: true | undefined;
	// supportsCORS?: true | undefined;
	// requestDefaults?: DeclarativeRestApiSettings.HttpRequestOptions;

	// translation?: { [key: string]: object };
	// mockManualExecution?: true;
	// triggerPanel?: TriggerPanelDefinition | boolean;
	// extendsCredential?: string;
	hints?: NodeHint[];
	// communityNodePackageVersion?: string;
	waitingNodeTooltip?: string;
}

export type NodeHint = {
	message: string;
	type?: 'info' | 'warning' | 'danger';
	location?: 'outputPane' | 'inputPane' | 'ndv';
	displayCondition?: string;
	whenToDisplay?: 'always' | 'beforeExecution' | 'afterExecution';
};

export type NodeExecutionHint = Omit<NodeHint, 'whenToDisplay' | 'displayCondition'>;

export interface INodeTypes {
	getByName(nodeType: string): INodeType;
	// getByNameAndVersion(nodeType: string, version?: number): INodeType;
	// getKnownTypes(): IDataObject;
}

export interface INodeType {
	description: INodeTypeDescription;
	getProperties(): INodeTypeDescription;
	supplyData?(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData>;
	execute?(this: IExecuteFunctions, response?: EngineResponse): Promise<NodeOutput>;
	/**
	 * A function called when a node receives a chat message. Allows it to react
	 * to the message before it gets executed.
	 */
	onMessage?(context: IExecuteFunctions, data: INodeExecutionData): Promise<NodeOutput>;
	// poll?(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
	trigger?(this: ITriggerFunctions): Promise<ITriggerResponse | undefined>;
	// webhook?(this: IWebhookFunctions): Promise<IWebhookResponseData>;
	methods?: {
		loadOptions?: {
			[key: string]: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>;
		};
		// listSearch?: {
		// 	[key: string]: (
		// 		this: ILoadOptionsFunctions,
		// 		filter?: string,
		// 		paginationToken?: string,
		// 	) => Promise<INodeListSearchResult>;
		// };
		credentialTest?: {
			// Contains a group of functions that test credentials.
			[functionName: string]: ICredentialTestFunction;
		};
		resourceMapping?: {
			[functionName: string]: (this: ILoadOptionsFunctions) => Promise<ResourceMapperFields>;
		};
		localResourceMapping?: {
			[functionName: string]: (this: ILocalLoadOptionsFunctions) => Promise<ResourceMapperFields>;
		};
		actionHandler?: {
			[functionName: string]: (
				this: ILoadOptionsFunctions,
				payload: IDataObject | string | undefined,
			) => Promise<NodeParameterValueType>;
		};
	};
	// webhookMethods?: {
	// 	[name in WebhookType]?: {
	// 		[method in WebhookSetupMethodNames]: (this: IHookFunctions) => Promise<boolean>;
	// 	};
	// };
	/**
	 * Defines custom operations for nodes that do not implement an `execute` method, such as declarative nodes.
	 * This function will be invoked instead of `execute` for a specific resource and operation.
	 * Should be either `execute` or `customOperations` defined for a node, but not both.
	 *
	 * @property customOperations - Maps specific resource and operation to a custom function
	 */
	// customOperations?: {
	// 	[resource: string]: {
	// 		[operation: string]: (this: IExecuteFunctions) => Promise<NodeOutput>;
	// 	};
	// };
}

export interface NodeExecutionWithMetadata extends INodeExecutionData {
	pairedItem: IPairedItemData | IPairedItemData[];
}

export type NodeOutput =
	| INodeExecutionData[][]
	| NodeExecutionWithMetadata[][]
	| EngineRequest
	| null;

export declare enum Position {
    Left = "left",
    Top = "top",
    Right = "right",
    Bottom = "bottom"
}

export type CoordinateExtent = [[number, number], [number, number]];

export type NodeHandle = Omit<Optional<IHandle, 'width' | 'height'>, 'nodeId'>;

export type INodeBase<NodeData extends Record<string, unknown> = Record<string, unknown>, NodeType extends string | undefined = string | undefined> = {
    id: string;
    position: {
		x: number,
		y: number
	};
    data: NodeData;
    sourcePosition?: Position;
    targetPosition?: Position;
    hidden?: boolean;
    selected?: boolean;
    dragging?: boolean;
    draggable?: boolean;
    selectable?: boolean;
    connectable?: boolean;
    deletable?: boolean;
    dragHandle?: string;
    width?: number;
    height?: number;
    initialWidth?: number;
    initialHeight?: number;
    parentId?: string;
    zIndex?: number;
    extent?: 'parent' | CoordinateExtent | null;
    expandParent?: boolean;
    ariaLabel?: string;
    origin?: [number, number];
    handles?: NodeHandle[];
    measured?: {
        width?: number;
        height?: number;
    };
} & (undefined extends NodeType ? {
    type?: string | undefined;
} : {
    type: NodeType;
});

export type INodeConstructor<NodeData extends Record<string, unknown> = Record<string, unknown>, NodeType extends string | undefined = string | undefined> = INodeBase<NodeData, NodeType> & {
    className?: string;
    resizing?: boolean;
    focusable?: boolean;
};

export type INode = INodeConstructor<INodeData, string>;