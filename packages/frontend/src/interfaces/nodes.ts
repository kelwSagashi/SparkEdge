import type { Node, NodeProps } from "@xyflow/react";
import type { ComponentType } from "react";
import type { INodeData, BuilderNodeTypes } from 'nmg8-workflow';

export type INode = Node<INodeData, string>;

export type IBaseNodeProps = NodeProps<
    Node<INodeData, string>
>;

export interface RegisterNodeMetadata<T = Record<string, unknown>> {
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
