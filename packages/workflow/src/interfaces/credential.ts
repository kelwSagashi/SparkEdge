import { IDataObject } from "./data";
import { Logger } from "./logs";

export type CredentialInformation =
	| string
	| string[]
	| number
	| boolean
	| IDataObject
	| IDataObject[];

// The encrypted credentials which the nodes can access
export interface ICredentialDataDecryptedObject {
	[key: string]: CredentialInformation;
}

export type ProjectSharingData = {
	id: string;
	name: string | null;
	icon: { type: 'emoji' | 'icon'; value: string } | null;
	type: 'personal' | 'team' | 'public';
	createdAt: string;
	updatedAt: string;
};

export interface ICredentialsDecrypted<T extends object = ICredentialDataDecryptedObject> {
	id: string;
	name: string;
	type: string;
	data?: T;
	homeProject?: ProjectSharingData;
	sharedWithProjects?: ProjectSharingData[];
}

export interface INodeCredentialTestResult {
	status: 'OK' | 'Error';
	message: string;
}


export type ICredentialTestFunction = (
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted<ICredentialDataDecryptedObject>,
) => Promise<INodeCredentialTestResult>;

export interface ICredentialTestFunctions {
	logger: Logger;
	helpers:
	// SSHTunnelFunctions & 
	{
		request: (uriOrObject: string | object, options?: object) => Promise<any>;
	};
}