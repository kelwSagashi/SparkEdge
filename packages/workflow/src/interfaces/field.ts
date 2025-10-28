export type FormFieldsParameter = Array<{
	fieldLabel: string;
	elementName?: string;
	fieldType?: string;
	requiredField?: boolean;
	fieldOptions?: { values: Array<{ option: string }> };
	multiselect?: boolean;
	multipleFiles?: boolean;
	acceptFileTypes?: string;
	formatDate?: string;
	html?: string;
	placeholder?: string;
	fieldName?: string;
	fieldValue?: string;
	limitSelection?: 'exact' | 'range' | 'unlimited';
	numberOfSelections?: number;
	minSelections?: number;
	maxSelections?: number;
}>;

export type FieldTypeMap = {
	// eslint-disable-next-line id-denylist
	boolean: boolean;
	// eslint-disable-next-line id-denylist
	number: number;
	// eslint-disable-next-line id-denylist
	string: string;
	'string-alphanumeric': string;
	dateTime: string;
	time: string;
	array: unknown[];
	object: object;
	options: any;
	url: string;
	jwt: string;
	'form-fields': FormFieldsParameter;
};

export type FieldType = keyof FieldTypeMap;

export type ValidationResult<T extends FieldType = FieldType> =
	| { valid: false; errorMessage: string }
	| {
		valid: true;
		newValue?: FieldTypeMap[T];
	};