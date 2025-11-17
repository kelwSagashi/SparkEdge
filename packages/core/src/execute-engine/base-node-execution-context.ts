import { IExecuteFunctions, IGetNodeParameterOptions, INode, INodeTypeExecutionContext, INodeExecutionData, INodeType, ITriggerFunctions, ITriggerResponse, NodeOutput, NodeParameterValueType } from "nmg8-workflow";

export abstract class BaseNodeExecutionContext implements INodeTypeExecutionContext {
    abstract node: INode;
	abstract nodeClazz: INodeType;

	// getExecutionId() {
    //     return this.workflow.id;
	// }

	getNode(): INode {
		throw Error("NotImpelemented");
	};

	// getWorkflow() {
	// 	const { id, name, active } = this.workflow;
	// 	return { id, name, active };
	// }

	// getMode() {
	// 	return this.mode;
	// }

	// getWorkflowStaticData(type: string) {
	// 	return this.workflow.getStaticData(type, this.node);
	// }

	// get nodeType() {
	// 	const { type } = this.node;
	// 	return this.workflow.nodeTypes.getByName(type);
	// }
	callNodeMethod(method: keyof INodeType): Promise<any> {
		throw Error("NotImpelemented");
	};
		// return this.nodeClazz.callMethod(method, this);

	getNodeParameter<T>(parameterName: string, fallbackValue?: T, options?: IGetNodeParameterOptions): NodeParameterValueType<T>{
		throw Error("NotImpelemented");
	};

	_getNodeParameter<T>(parameterName: string, fallbackValue?: T, options?: IGetNodeParameterOptions): NodeParameterValueType<T>{
		throw Error("NotImpelemented");
	}

	prepareOutputData(outputData: INodeExecutionData[]): Promise<any> {
		throw Error("NotImpelemented");
	}

	execute(
	): Promise<NodeOutput> {
		throw Error("NotImpelemented");
	};

	onMessage(
		context: IExecuteFunctions,
		data: INodeExecutionData
	): Promise<NodeOutput> {
		throw Error("NotImpelemented");
	};

	trigger(this: ITriggerFunctions): Promise<ITriggerResponse | undefined> {
		throw Error("NotImpelemented");
	};
}