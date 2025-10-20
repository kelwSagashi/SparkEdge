"use client"
import { useReactFlow, type FinalConnectionState, type OnConnectStartParams } from "@xyflow/react";
import { useCallback } from "react";

export function useAddOnEdgeDrop() {
    const { setNodes } = useReactFlow()
    const updateNodeConnectingState = useCallback(
        (
            nodeId: string | null,
            isConnecting: boolean
        ) => {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === nodeId) {
                        return { ...n, data: { ...n.data, isConnecting } };
                    }
                    return { ...n, data: { ...n.data } };
                })
            );
        },
        [setNodes]
    );

    const handleOnEdgeConnectedStart = useCallback(
        (
            event: MouseEvent | TouchEvent,
            params: OnConnectStartParams
        ) => {
            updateNodeConnectingState(
                params.nodeId,
                true
            );
        },
        [updateNodeConnectingState]
    );

    const handleOnEdgeDropConnectedEnd = useCallback(
        (
            event: MouseEvent | TouchEvent,
            connectionState: FinalConnectionState
        ) => {
            updateNodeConnectingState(
                connectionState.fromNode?.id ?? null,
                !!connectionState.toNode?.id
            );
        },
        [updateNodeConnectingState]
    );

    return {
        handleOnEdgeDropConnectedEnd,
        handleOnEdgeConnectedStart
    }
}