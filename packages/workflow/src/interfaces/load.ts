import type { INodeType, INodeTypeDescription } from './node'
export type LoadingDetails = {
	className: string;
	sourcePath: string;
};

// export type CredentialLoadingDetails = LoadingDetails & {
// 	supportedNodes?: string[];
// 	extends?: string[];
// };

export type NodeLoadingDetails = LoadingDetails;

export type KnownNodes = {
	nodes: Record<string, NodeLoadingDetails>;
	// credentials: Record<string, CredentialLoadingDetails>;
};

export interface LoadedNodesAndCredentials {
	nodes: INodeTypeData;
}

export interface LoadedClass<T> {
	sourcePath: string;
	type: T;
}
type LoadedData<T> = Map<string, LoadedClass<T>>;

export type INodeTypeData = LoadedData<INodeType>;

export type Types = {
	nodes: INodeTypeDescription[];
	// credentials: ICredentialType[];
};