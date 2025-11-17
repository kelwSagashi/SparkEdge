import type { Position } from "./node";

export type IEdgeBase<EdgeData extends Record<string, unknown> = Record<string, unknown>, EdgeType extends string | undefined = string | undefined> = {
    id: string;
    type?: EdgeType;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    animated?: boolean;
    hidden?: boolean;
    deletable?: boolean;
    selectable?: boolean;
    data?: EdgeData;
    selected?: boolean;
    markerStart?: IEdgeMarkerType;
    markerEnd?: IEdgeMarkerType;
    zIndex?: number;
    ariaLabel?: string;
    interactionWidth?: number;
};

export type IEdgeMarker = {
    type: IMarkerType | `${IMarkerType}`;
    color?: string | null;
    width?: number;
    height?: number;
    markerUnits?: string;
    orient?: string;
    strokeWidth?: number;
};

export type IEdgeMarkerType = string | IEdgeMarker;

export declare enum IMarkerType {
    Arrow = "arrow",
    ArrowClosed = "arrowclosed"
}

export type IHandleType = 'source' | 'target';

export type IHandle = {
    id?: string | null;
    nodeId: string;
    x: number;
    y: number;
    position: Position;
    type: IHandleType;
    width: number;
    height: number;
};

export type IEdgeConstructor<EdgeData extends Record<string, unknown> = Record<string, unknown>, EdgeType extends string | undefined = string | undefined> = IEdgeBase<EdgeData, EdgeType> & {
    className?: string;
    reconnectable?: boolean | IHandleType;
    focusable?: boolean;
};

export type IEdge = IEdgeConstructor;
