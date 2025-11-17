import { useWorkflowStore } from "@/stores/workflow-store";
import { getConnectedEdges, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export function useDeleteNode() {
    const { getNode, getEdges, deleteElements } = useReactFlow();
    const [deleteNode, deleteEdge] = useWorkflowStore(
        useShallow((state) => [
            state.deleteNode,
            state.deleteEdge,
        ])
    );

    return useCallback(
        (id: string) => {
            const node = getNode(id);
            if (!node) return;

            const edges = getEdges();
            const connectedEdges = getConnectedEdges([node], edges);

            deleteElements({ nodes: [node], edges: connectedEdges }).then();
            
            deleteNode(node.id);

            for (const edge of connectedEdges) {
                deleteEdge(edge.id);
            }
        },
        [deleteElements, getEdges, getNode, deleteNode, deleteEdge]
    );
}