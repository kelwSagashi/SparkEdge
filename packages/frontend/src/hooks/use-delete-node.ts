import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export function useDeleteNode() {
    const { setNodes, setEdges } = useReactFlow();
    return useCallback(
        (nodeId: string) => {
            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
        },
        [setNodes, setEdges]
    );
}