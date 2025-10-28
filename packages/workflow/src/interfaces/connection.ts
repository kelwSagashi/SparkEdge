import { NodeConnectionType } from "./node";

export interface IConnection {
	// The node the connection is to
	node: string;

	// The type of the input on destination node (for example "main")
	type: NodeConnectionType;

	// The output/input-index of destination node (if node has multiple inputs/outputs of the same type)
	index: number;
}

export type NodeInputConnections = Array<IConnection[] | null>;

export interface INodeConnections {
	// Input name
	[key: string]: NodeInputConnections;
}

export interface IConnections {
	// Node name
	[key: string]: INodeConnections;
}