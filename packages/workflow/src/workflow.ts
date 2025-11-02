import type { IConnections } from "./interfaces/connection";
import type { IDataObject } from "./interfaces/data";
import type { INodeTypes } from "./interfaces/node";
import type { IWorkflowSettings } from "./interfaces/workflow";
import { type INode } from 'nmg8-frontend/src/interfaces';

export interface WorkflowParameters {
	id: string;
	name: string;
	nodes: INode[];
	connections: IConnections;
	active: boolean;
	nodeTypes: INodeTypes;
	staticData?: IDataObject;
	settings?: IWorkflowSettings;
}

export class Workflow {
    id: string;
    name: string;
    nodes: INode[] = [];
    edges: string[] = [];
    connectionsByDestinationNode: IConnections = {};
    // nodeTypes: INodeTypes;
    active: boolean;

    settings: IWorkflowSettings = {};

    // staticData: IDataObject;

	testStaticData: IDataObject | undefined;

    constructor(parameters: WorkflowParameters) {
        this.id = parameters.id;
        this.name = parameters.name;

        // this.setNodes(parameters.nodes);
		// this.setConnections(parameters.connections);
		this.setSettings(parameters.settings ?? {});

		this.active = parameters.active || false;
    }

    setSettings(settings: IWorkflowSettings) {
		this.settings = settings;
	}

    // setNodes(nodes: INode[]) {
	// 	this.nodes = nodes;
	// }

    // setConnections(connections: IConnections) {
	// 	this.connectionsBySourceNode = connections;
	// 	this.connectionsByDestinationNode = mapConnectionsByDestination(this.connectionsBySourceNode);
	// }
}