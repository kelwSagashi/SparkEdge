import type { ComponentType } from "react";
import type { BuilderNodeGroupTypes, BuilderNodeTypes } from '@nmg8/workflow/src/constants'
import type { ExpressionString, INodeInputConfiguration, INodeOutputConfiguration, INodeTypeDescription, NodeGroupType } from '@nmg8/workflow/src'

export interface RegisterNodeMetadata<T = Record<string, unknown>> {
    group: BuilderNodeGroupTypes,
    types: BuilderNodeTypes[];
    defaultData?: T;
    selected: boolean;
    node: ComponentType<any>;
    available?: boolean;
    propertyPanel?: ComponentType<any>;
    deletable?: boolean;
    isConnecting?: boolean;
    notes?: string;
};

export type IBaseNodeTypeDescription = {
    type: BuilderNodeTypes;
    group: NodeGroupType;
}

export interface BaseNodeData extends Record<string, unknown> {
    name: string;
    inputNames?: string[];
	inputs: Array<INodeInputConfiguration> | ExpressionString;
	outputs: Array<INodeOutputConfiguration> | ExpressionString;
	outputNames?: string[];
	requiredInputs?: string | number[] | number;
    parameters: IBaseNodeTypeDescription;
    onExecute: () => void;
}