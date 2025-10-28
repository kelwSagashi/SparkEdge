import { DeclarativeRestApiSettings } from "./restapi";


export interface IAuthenticateRuleBase {
	type: string;
	properties: {
		[key: string]: string | number;
	};
	errorMessage?: string;
}

export interface IAuthenticateRuleResponseCode extends IAuthenticateRuleBase {
	type: 'responseCode';
	properties: {
		value: number;
		message: string;
	};
}

export interface IAuthenticateRuleResponseSuccessBody extends IAuthenticateRuleBase {
	type: 'responseSuccessBody';
	properties: {
		message: string;
		key: string;
		value: any;
	};
}

export interface ICredentialTestRequest {
	request: DeclarativeRestApiSettings.HttpRequestOptions;
	rules?: IAuthenticateRuleResponseCode[] | IAuthenticateRuleResponseSuccessBody[];
}
