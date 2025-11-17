import type { INode } from "@/interfaces/nodes";
import { api } from "@/server/server.service";
import { type INodeData, type BuilderNodeTypes } from 'nmg8-workflow/src/index.ts';
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useCallback } from "react";
import * as uuid from 'uuid';
import { useWorkflowStore } from "@/stores/workflow-store";
import { useShallow } from "zustand/react/shallow";

export function useInsertNode() {
    const [
        addNode,
        getNodes
    ] = useWorkflowStore(
        useShallow(s => [
            s.addNode,
            s.getNodes,
        ])
    );
    const { screenToFlowPosition, updateNode } =
        useReactFlow();

    return useCallback(
        async (name: string, pos?: XYPosition) => {
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


            const description = (await api.getNodeDescription({name: name})).data;
            const data: INodeData = {
                name: description.displayName,
                inputs: description.inputs,
                outputs: description.outputs,
                parameters: {},
                id,
                type: description.type,
                version: description.version,
            }

            const newNode: INode = {
                id,
                type: 'base',
                position: _pos,
                selected: true,
                data,
                deletable: true,
                measured: {
                    height: 100,
                    width: 200
                },
            };

            addNode(newNode);

            return newNode;
        },
        [screenToFlowPosition, getNodes, addNode, updateNode]
    );
}