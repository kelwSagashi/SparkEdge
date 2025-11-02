import type { Node, NodeProps } from "@xyflow/react";
import type { ComponentType } from "react";
import type { INodeData, BuilderNodeGroupTypes, BuilderNodeTypes } from 'nmg8-workflow/src/index.ts';

export type INode = Node<INodeData, string>;

export type IBaseNodeProps = NodeProps<
    Node<INodeData, string>
>;

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
