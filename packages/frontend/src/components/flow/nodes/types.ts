import type { ComponentType } from "react";

export enum BuilderNodes {
    SCRIPT = 'script',
    SERVER = 'server'
}
export type BuilderNodeType = `${BuilderNodes}`;


export interface RegisterNodeMetadata<T = Record<string, unknown>> {
    type: BuilderNodeType,
    defaultData?: T;
    selected: boolean;
    node: ComponentType<any>;
    connection: {
        inputs: number;
        outputs: number;
    };
    available?: boolean;
    propertyPanel?: ComponentType<any>;
};

export interface BaseNodeData extends Record<string, unknown> {
    label: string;
    onExecute?: () => void;
    isConnecting?: boolean;
    deletable?: boolean;
}