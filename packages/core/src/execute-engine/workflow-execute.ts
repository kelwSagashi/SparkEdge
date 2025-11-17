import { EngineRequest, EngineResponse, ExecutionStatus, IExecuteData, INode, INodeData, INodeExecutionData, IRun, IRunExecutionData, IRunNodeResponse, Workflow, WorkflowExecuteMode } from "nmg8-workflow";
import PCancelable from "p-cancelable";

export class WorkflowExecute {
    private status: ExecutionStatus = 'new';
    private readonly abortController = new AbortController();
	timedOut: boolean = false;

    constructor( 
        private readonly mode: WorkflowExecuteMode,
        private runExecutionData: IRunExecutionData = {
			startData: {},
			resultData: {
				runData: {},
				pinData: {},
			},
			executionData: {
				contextData: {},
				nodeExecutionStack: [],
				metadata: {},
				waitingExecution: {},
				waitingExecutionSource: {},
			},
		},
    ) {}

    run(
        workflow: Workflow,
        destinationNode?: string, // Node to stop execution at
    )
	// : PCancelable<IRun> 
	{
        this.status = 'running';

        const startNode = workflow.getStartNode();

        if (!startNode) {
			// throw new Error('No node to start the workflow from could be found');
			return workflow.buildGraph();
		}

        let runNodeFilter: string[] | undefined;
		if (destinationNode) {
			runNodeFilter = workflow.getParentNodes(destinationNode)?.map(node => node.id);
			runNodeFilter.push(destinationNode);
		}

		return {startNode};

        // const nodeExecutionStack: IExecuteData[] = [
		// 	{
		// 		node: startNode,
		// 		data: {
		// 			main: [
		// 				[
		// 					{
		// 						data: {},
		// 					},
		// 				],
		// 			],
		// 		},
		// 		source: null,
		// 	},
		// ];

        // this.runExecutionData = {
		// 	startData: {
		// 		destinationNode,
		// 		runNodeFilter,
		// 	},
		// 	resultData: {
		// 		runData: {},
		// 	},
		// 	executionData: {
		// 		contextData: {},
		// 		nodeExecutionStack,
		// 		metadata: {},
		// 		waitingExecution: {},
		// 		waitingExecutionSource: {},
		// 	},
		// };

		// return this.processRunExecutionData(workflow);
    }

    processRunExecutionData(workflow: Workflow)
	// : PCancelable<IRun> 
	{
        let executionData: IExecuteData;
        let executionNode: INode;

        return new PCancelable(async (resolve, _reject, onCancel) => {
            const startedAt = new Date();
			
			onCancel(() => {
                this.status = 'canceled';
                this.abortController.abort();
            })

            const returnPromise = (async () => {
                executionLoop: while (
                    this.runExecutionData.executionData!.nodeExecutionStack.length !== 0
                ) {
                    executionData = this.runExecutionData.executionData!.nodeExecutionStack.shift() as IExecuteData;
                    executionNode = executionData.node;

                    if (this.status === 'canceled') {
						return;
					}

                    let nodeSuccessData: INodeExecutionData[][] | null | undefined = null;

                    let runNodeData = await this.runNode(
                        workflow,
                        executionData,
                        // this.runExecutionData,
                        // runIndex,
                        // this.additionalData,
                        // this.mode,
                        // this.abortController.signal,
                        // subNodeExecutionResults,
                    );
                }

				return;
            })()
				.then(async () => {
					return await this.processSuccessExecution(
						startedAt,
						workflow
					)
				})

			return await returnPromise.then(resolve);
        })
    }

	async processSuccessExecution(
		startedAt: Date,
		workflow: Workflow
	) {
		const fullRunData = this.getFullRunData(startedAt)

		return fullRunData;
	}

	getFullRunData(startedAt: Date): IRun {
		return {
			data: this.runExecutionData,
			mode: this.mode,
			startedAt,
			stoppedAt: new Date(),
			status: this.status,
		};
	}


    async runNode(
		workflow: Workflow,
		executionData: IExecuteData,
		// runExecutionData: IRunExecutionData,
		// runIndex: number,
		// abortSignal?: AbortSignal,
		// subNodeExecutionResults?: EngineResponse,
	)
	// : Promise<IRunNodeResponse | EngineRequest> 
	{
        const { node } = executionData;
		let inputData = executionData.data;

        
    }
}