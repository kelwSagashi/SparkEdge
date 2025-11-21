import { INodeTypeExecutionContext, INodeInputConfiguration, INodeOutputConfiguration, INodeType, INodeTypeDescription, INodeTypeReturns, NodeOutput, IExecuteFunctions } from "nmg8-workflow";

export abstract class NodeType implements INodeType {
	abstract description: INodeTypeDescription;

	getInputs(context: INodeTypeExecutionContext): Promise<INodeTypeReturns<Array<INodeInputConfiguration>>> {
		throw Error("NotImpelemented");	
	}

	getOutputs(context: INodeTypeExecutionContext): Promise<INodeTypeReturns<Array<INodeOutputConfiguration>>> {
		throw Error("NotImpelemented");	
	}

	getProperties(): INodeTypeDescription {
		throw Error("NotImpelemented");	
	}

	test?(context: INodeTypeExecutionContext): Promise<INodeTypeReturns<any>>;


	execute(context: IExecuteFunctions): Promise<NodeOutput> {
		throw Error("NotImpelemented");	
	};

	callMethod(
		method: keyof INodeType,
		context: INodeTypeExecutionContext
	) {
		const instance: INodeType = this;
		switch (method) {
			case 'getInputs':
				return instance.getInputs(context);
			case 'getOutputs':
				return instance.getOutputs(context);
			default:
				throw new Error(`Método ${String(method)} não existe`);
		}
		// const fn = instance[method];
		// if (typeof fn === "function") {
		// 	return Promise.resolve((fn as any).apply(this, context));
		// }
	}
}
