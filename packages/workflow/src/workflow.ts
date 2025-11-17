import type { IDataObject } from "./interfaces/data";
import type { IEdge } from "./interfaces/edge";
import { Graph } from "./interfaces/graph";
import type { INode, INodeTypes } from "./interfaces/node";
import type { IWorkflowBase, IWorkflowSettings } from "./interfaces/workflow";

export type WorkflowParameters = IWorkflowBase;

export class WorkflowTest {
	constructor() { }
	getWorkflow() { return {data: 'workflow'} }
}

export class Workflow {
    id: string;
    name: string;
    nodes: INode[] = [];
    edges: IEdge[] = [];
    active: boolean;
    settings: IWorkflowSettings = {};
	testStaticData: IDataObject | undefined;

    constructor(parameters: WorkflowParameters) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.settings = parameters.settings || {};
		this.active = parameters.active || false;
		this.nodes = parameters.nodes;
		this.edges = parameters.edges;
    }

	getStartNode(){
		return this.buildGraph().findRoot()?.data;
	}

	getDestinationNode(destinationNode: string) {
		const graph = this.buildGraph();
		for (const node of graph._iterableNodeValues()) {
			if (node.data.id === destinationNode){
				return node.data;
			}
		}	
		return null;
	}

	getParentNodes(destinationNode: string) {
		const graph = this.buildGraph();
		const dNode = this.getDestinationNode(destinationNode);
		if (!dNode) return [];

		return graph.getParentNodes(dNode);
	}

	getStaticData(type: string, node: INode): IDataObject {
		return {};
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


	buildGraph() {
		const graph = new Graph<INode>((a, b) => a.id.localeCompare(b.id));

		const nodeSet = new Map<string, INode>();

		for (const node of this.nodes) {
			nodeSet.set(node.id, node);
			graph.addNewNode(node);
		}

		for (const edge of this.edges) {
			const source = nodeSet.get(edge.source);
			const target = nodeSet.get(edge.target);
			if (source && target) {
				graph.addEdge(source, target);
			}
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
			settings: this.settings
		});
	}
}