import type { IDataObject } from "./data";
import type { IExecuteSingleFunctions } from "./functions";
import type { INodeExecutionData } from "./node";

export interface IPostReceiveBase {
	type: string;
	enabled?: boolean | string;
	properties: {
		[key: string]: string | number | boolean | IDataObject;
	};
	errorMessage?: string;
}

export interface IPostReceiveBinaryData extends IPostReceiveBase {
	type: 'binaryData';
	properties: {
		destinationProperty: string;
	};
}

export interface IPostReceiveFilter extends IPostReceiveBase {
	type: 'filter';
	properties: {
		pass: boolean | string;
	};
}

export interface IPostReceiveLimit extends IPostReceiveBase {
	type: 'limit';
	properties: {
		maxResults: number | string;
	};
}

export interface IPostReceiveRootProperty extends IPostReceiveBase {
	type: 'rootProperty';
	properties: {
		property: string;
	};
}

export interface IPostReceiveSet extends IPostReceiveBase {
	type: 'set';
	properties: {
		value: string;
	};
}

export interface IPostReceiveSetKeyValue extends IPostReceiveBase {
	type: 'setKeyValue';
	properties: {
		[key: string]: string | number;
	};
}

export interface IPostReceiveSort extends IPostReceiveBase {
	type: 'sort';
	properties: {
		key: string;
	};
}

export type PostReceiveAction =
	| ((
			this: IExecuteSingleFunctions,
			items: INodeExecutionData[],
			response: any,
	  ) => Promise<INodeExecutionData[]>)
	| IPostReceiveBinaryData
	| IPostReceiveFilter
	| IPostReceiveLimit
	| IPostReceiveRootProperty
	| IPostReceiveSet
	| IPostReceiveSetKeyValue
	| IPostReceiveSort;