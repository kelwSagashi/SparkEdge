import { ExecutionStatus, Graph, GraphNode, INode, INodeExecutionData, IRun, NodeOutput, Workflow, WorkflowExecuteMode } from "nmg8-workflow";
import PCancelable from "p-cancelable";
import { NodeExecutionContext } from "./node-execution-context";

export class WorkflowExecute {
    private status: ExecutionStatus = 'new';
    private readonly abortController = new AbortController();
	timedOut: boolean = false;
	private graph: Graph<INode>;

    constructor( 
        private readonly mode: WorkflowExecuteMode,
		private workflow: Workflow,
    ) {
		this.graph = this.workflow.buildGraph();
	}

    async run(
        destinationNode?: string, // Node to stop execution at
    )
	// : PCancelable<IRun> 
	{
        this.status = 'running';

        const executionQueue: GraphNode<INode>[] = [];
        const inDegrees = new Map<GraphNode<INode>, number>();

		for (const graphNode of this.graph.nodes.values()) {
            const inDegree = graphNode.predecessors.length;
            inDegrees.set(graphNode, inDegree);
            if (inDegree === 0) {
                executionQueue.push(graphNode);
            }
        }

        if (executionQueue.length === 0) {
            throw new Error('Workflow has no start node or contains a cycle.');
        }

        const exectionData = await this.processRunExecutionData(executionQueue, inDegrees, destinationNode);

		console.log('workflow execute data', exectionData);

		return exectionData;
    }

	private getInputForNode(node: GraphNode<INode>, nodeOutputs: Map<string, INodeExecutionData>): INodeExecutionData[] {
		if (node.predecessors.length === 0) {
			return [];
		}

		const contextualInput: INodeExecutionData[] = [];
		
		// Para cada nó pai que se conecta ao nó atual...
		for (const predecessor of node.predecessors) {
			// Encontra a aresta específica que conecta este pai ao nó atual
			const edge = this.workflow.edges.find(e => e.source === predecessor.data.id && e.target === node.data.id);
			
			const outputData: INodeExecutionData = nodeOutputs.get(predecessor.data.id) ?? {
				data: {}
			};
			
			if (edge && outputData) {
				contextualInput.push({
					...outputData,
					targetHandle: edge.targetHandle ?? undefined,
					sourceHandle: edge.sourceHandle ?? undefined
				});
			}
		}
		
		return contextualInput;
    }

    processRunExecutionData(
		executionQueue: GraphNode<INode>[], 
		inDegrees: Map<GraphNode<INode>, number>, 
		destinationNode?: string
	)
	: PCancelable<IRun> 
	{
		
        let nodeOutputs = new Map<string, INodeExecutionData>();

        return new PCancelable(async (resolve, _reject, onCancel) => {
            const startedAt = new Date();
			
			onCancel(() => {
                this.status = 'canceled';
                this.abortController.abort();
            })

            const returnPromise = (async () => {
                executionLoop: while (
                    executionQueue.length !== 0
                ) {
                    const currentNode = executionQueue.shift()!;

                    if (this.status === 'canceled') {
						return;
					}

					const { 
						id: currentNodeId, 
						data: {name: currentNodeType},  	
					} = currentNode.data;
					
					const inputData = this.getInputForNode(currentNode, nodeOutputs);
					
					const nodeInstance = this.workflow.nodeTypes.getByName(currentNodeType);
					if (!nodeInstance) throw new Error(`Node type "${currentNodeType}" not registered.`);

					const nodeContext = new NodeExecutionContext(currentNode.data, nodeInstance);

					let nodeOutput: NodeOutput;

					try {
						nodeOutput = await nodeInstance.execute({
							nodeContext,
							getInputData() {
								return inputData
							},
						});
					} catch (error) {
						console.log('execute error', error);
						nodeOutput = {
							data: {}
						}	
						this.status = 'error';
						break;
					}
					
					nodeOutputs.set(currentNodeId, nodeOutput);

					// 3. Para cada sucessor (adjNode), decrementar seu in-degree
					for (const successorNode of currentNode.adjNodes) {
						const currentInDegree = inDegrees.get(successorNode)!;
						const newInDegree = currentInDegree - 1;
						inDegrees.set(successorNode, newInDegree);

						// Se o in-degree se tornar 0, ele está pronto para ser executado
						if (newInDegree === 0) {
							executionQueue.push(successorNode);
						}
					}

					if (destinationNode && destinationNode === currentNodeId) {
						break;
					}
                }

				return nodeOutputs;
            })()
				.then(async (data) => {
					if (!data) throw new Error("Exection Error");
					return this.processSuccessExecution(startedAt, data);
				})

			return await returnPromise.then(resolve);
        })
    }

	async processSuccessExecution(
		startedAt: Date,
		nodeOutputs: Map<string, INodeExecutionData>
	) {
		const fullRunData = this.getFullRunData(startedAt, nodeOutputs)

		return fullRunData;
	}

	getFullRunData(startedAt: Date, nodeOutputs: Map<string, INodeExecutionData>): IRun {
		const data = Object.fromEntries(nodeOutputs);
		return {
			data,
			mode: this.mode,
			startedAt,
			stoppedAt: new Date(),
			status: this.status,
		};
	}
}