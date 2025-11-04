import type { IDataObject } from "./interfaces/data";
import { IEdge } from "./interfaces/edge";
import type { INode, INodeTypes } from "./interfaces/node";
import type { IWorkflowSettings } from "./interfaces/workflow";

export interface WorkflowParameters {
	id: string;
	name: string;
	nodes: INode[];
	edges: IEdge[];
	active?: boolean;
	settings?: IWorkflowSettings;
	nodeTypes: INodeTypes;
}

export class Workflow {
    id: string;
    name: string;
    nodes: INode[] = [];
    edges: IEdge[] = [];
    active: boolean;

	nodeTypes: INodeTypes;

    settings: IWorkflowSettings = {};
	testStaticData: IDataObject | undefined;

    constructor(parameters: WorkflowParameters) {
        this.id = parameters.id;
        this.name = parameters.name;

		this.nodeTypes = parameters.nodeTypes;

        this.settings = parameters.settings || {};

		this.active = parameters.active || false;
    }

    setSettings(settings: IWorkflowSettings) {
		this.settings = settings;
	}

    setNodes(nodes: INode[]) {
		this.nodes = nodes;
	}

    setEdges(edges: IEdge[]) {
		this.edges = edges;
	}

	buildGraph(this: Workflow) {
		const graph: Record<string, string[]> = {};

		// Inicializa todos os nós
		for (const node of this.nodes) {
			graph[node.id] = [];
		}

		// Adiciona conexões (arestas)
		for (const edge of this.edges) {
			graph[edge.source].push(edge.target);
		}

		return graph;
	}

	getOnlySelected() {
		return new Workflow({
			edges: this.edges.filter(item => item.selected),
			nodes: this.nodes.filter(item => item.selected),
			id: this.id,
			name: this.name,
			active: this.active,
			settings: this.settings,
			nodeTypes: this.nodeTypes
		});
	}
}