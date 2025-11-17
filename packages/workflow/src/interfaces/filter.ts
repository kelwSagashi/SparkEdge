import type { NodeParameterValue } from "./node";
import type { NonEmptyArray } from "./utils";

export type FilterOperatorType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'array'
	| 'object'
	| 'dateTime'
	| 'any';

export interface FilterOperatorValue {
	type: FilterOperatorType;
	operation: string;
	rightType?: FilterOperatorType;
	singleValue?: boolean; // default = false
}

export type FilterConditionValue = {
	id: string;
	leftValue: NodeParameterValue | NodeParameterValue[];
	operator: FilterOperatorValue;
	rightValue: NodeParameterValue | NodeParameterValue[];
};

export type FilterOptionsValue = {
	caseSensitive: boolean;
	leftValue: string;
	typeValidation: 'strict' | 'loose';
	version: 1 | 2;
};

export type FilterTypeCombinator = 'and' | 'or';

export type FilterTypeOptions = {
	version: 1 | 2 | {}; // required so nodes are pinned on a version
	caseSensitive?: boolean | string; // default = true
	leftValue?: string; // when set, user can't edit left side of condition
	allowedCombinators?: NonEmptyArray<FilterTypeCombinator>; // default = ['and', 'or']
	maxConditions?: number; // default = 10
	typeValidation?: 'strict' | 'loose' | {}; // default = strict, `| {}` is a TypeScript trick to allow custom strings (expressions), but still give autocomplete
};

export type FilterValue = {
	options: FilterOptionsValue;
	conditions: FilterConditionValue[];
	combinator: FilterTypeCombinator;
};