import type { INode } from "@/interfaces/nodes";
import { api } from "@/server/server.service";
import { type INodeData, type BuilderNodeTypes } from 'nmg8-workflow/src/index.ts';
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { useCallback } from "react";
import * as uuid from 'uuid';

export function useInsertNode() {
    const { addNodes, screenToFlowPosition, getNodes, updateNode } =
        useReactFlow();

    return useCallback(
        async (builderType: BuilderNodeTypes, pos?: XYPosition) => {
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


            const description = (await api.getNodeDescription({type: builderType})).data;
            const type = `${description.group}.${builderType}`;
            const data: INodeData = {
                name: description.displayName,
                inputs: description.inputs,
                outputs: description.outputs,
                inputNames: description.inputNames,
                outputNames: description.outputNames,
                requiredInputs: description.requiredInputs,
                parameters: {},
                id,
                type: builderType,
                group: description.group,
                version: description.version
            }

            const newNode: INode = {
                id,
                type,
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