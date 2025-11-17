import type { FieldType } from "./field";
import type { NodeParameterValue } from "./node";

export type AssignmentCollectionValue = {
	assignments: AssignmentValue[];
};

export type AssignmentValue = {
	id: string;
	name: string;
	value: NodeParameterValue;
	type?: string;
};

export type AssignmentTypeOptions = Partial<{
	hideType?: boolean; // visible by default
	defaultType?: FieldType | 'string';
	disableType?: boolean; // visible by default
}>;