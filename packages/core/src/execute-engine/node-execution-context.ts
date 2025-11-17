import { get } from "lodash";
import { deepCopy, IGetNodeParameterOptions, INode, INodeExecutionData, INodeType, NodeParameterValueType, INodeTypeReturns } from "nmg8-workflow";
import { BaseNodeExecutionContext } from "./base-node-execution-context";

export class NodeExecutionContext extends BaseNodeExecutionContext {
	node: INode;
	nodeClazz: INodeType;
	
    constructor(
		node: INode,
		nodeClazz: INodeType
    ) {
		super();
		this.node = node;
		this.nodeClazz = nodeClazz;
	}


	// getExecutionId() {
    //     return this.workflow.id;
	// }

	getNode(): INode {
		return deepCopy(this.node);
	}

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

	getNodeParameter<T>(
		parameterName: string,
		fallbackValue?: T,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType<T> {
		return this._getNodeParameter<T>(parameterName, fallbackValue, options);
	}

	_getNodeParameter<T>(
		parameterName: string | [string],
		fallbackValue?: T,
		options?: IGetNodeParameterOptions,
	): NodeParameterValueType<T> {
		const { node } = this;

		const value = get(node.data.parameters, parameterName, fallbackValue);
    
		if (value === undefined) {
			throw new Error(`Could not get parameter ${parameterName}`);
		}

		if (options?.rawExpressions) {
			return value;
		}

		let returnData;

		if (options?.extractValue) {
			returnData = value;
		}

		// Make sure parameter value is the type specified in the ensureType option, if needed convert it
		if (options?.ensureType) {
			returnData = value;
		}

		if (options?.skipValidation) return returnData;

        // validate if schema
		returnData = value;

		return returnData;
	}

	async prepareOutputData(outputData: INodeExecutionData[]) {
		return [outputData];
	}

	callNodeMethod(method: keyof INodeType): Promise<INodeTypeReturns<any>> {
		return this.nodeClazz.callMethod(method, this);
	}
}