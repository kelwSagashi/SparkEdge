import { NodeParameterValue } from "./node";

export type DisplayCondition =
	| { _cnd: { eq: NodeParameterValue } }
	| { _cnd: { not: NodeParameterValue } }
	| { _cnd: { gte: number | string } }
	| { _cnd: { lte: number | string } }
	| { _cnd: { gt: number | string } }
	| { _cnd: { lt: number | string } }
	| { _cnd: { between: { from: number | string; to: number | string } } }
	| { _cnd: { startsWith: string } }
	| { _cnd: { endsWith: string } }
	| { _cnd: { includes: string } }
	| { _cnd: { regex: string } }
	| { _cnd: { exists: true } };

export interface IDisplayOptions {
	hide?: {
		[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
	};
	show?: {
		'@version'?: Array<number | DisplayCondition>;
		'@tool'?: boolean[];
		[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
	};

	hideOnCloud?: boolean;
}
export interface ICredentialsDisplayOptions {
	hide?: {
		[key: string]: NodeParameterValue[] | undefined;
	};
	show?: {
		'@version'?: number[];
		[key: string]: NodeParameterValue[] | undefined;
	};

	hideOnCloud?: boolean;
}