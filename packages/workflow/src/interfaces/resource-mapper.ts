import { FieldType } from "./field";
import { INodePropertyOptions } from "./node";

export interface ResourceMapperField {
	id: string;
	displayName: string;
	defaultMatch: boolean;
	canBeUsedToMatch?: boolean;
	required: boolean;
	display: boolean;
	type?: FieldType;
	removed?: boolean;
	options?: INodePropertyOptions[];
	readOnly?: boolean;
}

export type ResourceMapperValue = {
	mappingMode: string;
	value: { [key: string]: string | number | boolean | null } | null;
	matchingColumns: string[];
	schema: ResourceMapperField[];
	attemptToConvertTypes: boolean;
	convertFieldsToString: boolean;
};

export interface ResourceMapperFields {
	fields: ResourceMapperField[];
	emptyFieldsNotice?: string;
}