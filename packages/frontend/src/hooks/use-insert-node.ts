import { NODES } from "@/components/flow/nodes";
import type { BaseNodeData, BuilderNodes } from "@/components/flow/nodes/types";
import { useReactFlow, type Node, type XYPosition } from "@xyflow/react";
import { useCallback } from "react";
import * as uuid from 'uuid';

export function useInsertNode() {
    const { addNodes, screenToFlowPosition, getNodes, updateNode } =
        useReactFlow();

    return useCallback(
        (type: BuilderNodes, pos?: XYPosition) => {
            const _pos =
                pos ||
                screenToFlowPosition({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                });

            getNodes().forEach((node) => {
                if (node.selected) {
                    updateNode(node.id, { selected: false });
                }
            });

            const id = uuid.v4();

            const defaultData = NODES.find((node) => node.type === type)?.defaultData;

            const data: BaseNodeData = {
                label: "Sem titulo",
                ...defaultData
            }

            const newNode: Node<BaseNodeData, typeof type> = {
                id,
                type,
                position: _pos,
                selected: true,
                data
            };

            addNodes(newNode);

            return newNode;
        },
        [screenToFlowPosition, getNodes, addNodes, updateNode]
    );
}