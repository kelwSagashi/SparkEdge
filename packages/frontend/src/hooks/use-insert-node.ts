import type { BaseNodeData } from "@/components/flow/nodes/types";
import type { INodeTypeDescription } from "@nmg8/workflow/src";
import { BuilderNodes, NodeGroupTypes, type BuilderNodeGroupTypes, type BuilderNodeTypes } from "@nmg8/workflow/src/constants";
import { useReactFlow, type Node, type XYPosition } from "@xyflow/react";
import { useCallback } from "react";
import * as uuid from 'uuid';

export function useInsertNode() {
    const { addNodes, screenToFlowPosition, getNodes, updateNode } =
        useReactFlow();

    return useCallback(
        async (type: BuilderNodeTypes, pos?: XYPosition) => {
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

            const res = await fetch(`http://localhost:3000/api/nodes/${type}/description`);
            const description = await res.json() as INodeTypeDescription;
            const data: BaseNodeData = {
                name: description.displayName,
                inputs: description.inputs,
                outputs: description.outputs,
                inputNames: description.inputNames,
                outputNames: description.outputNames,
                requiredInputs: description.requiredInputs,
                parameters: {
                    group: description.group,
                    type: type
                },
                onExecute() {
                    console.log("executar")
                },
            }

            const newNode: Node<BaseNodeData, string> = {
                id,
                type: `${description.group}.${type}`,
                position: _pos,
                selected: true,
                data,
                deletable: true,
            };

            addNodes(newNode);

            return newNode;
        },
        [screenToFlowPosition, getNodes, addNodes, updateNode]
    );
}