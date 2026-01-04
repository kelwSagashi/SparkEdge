import type { IDataObject, INodeProperties } from "nmg8-workflow"
import NodeOptionsProperty from "./options-selector"
import NodeStringProperty from "./string-type"
import NodeResourceMapperProperty from "./resource-mapper"
import { useWorkflowStore } from "@/stores/workflow-store"
import { useShallow } from "zustand/react/shallow"
import { useCallback } from "react"
import { api } from "@/server/server.service"
import type { INode } from "@/interfaces"

export function RenderProperties({
    property,
    idx,
    node
}: {
    property: INodeProperties,
    idx: number,
    node: INode
}) {

    const [
        updateNodeParameters,
        updateNodeData,
        getNode,
    ] = useWorkflowStore(
        useShallow((s) => [
            s.updateNodeParameters,
            s.updateNodeData,
            s.getNode
        ])
    )

    const handleOptionsSelect = useCallback(
        async (
            value: IDataObject, 
            property: Extract<INodeProperties, { type: 'options' }>
            ) => {
            updateNodeParameters(node.id, value);

            const _node = getNode(node.id);

            if (!_node) return;

            for (const onSel of property.onSelect ?? []) {
                const onSelUpdateNodeData = onSel.updateNodeData;

                if (onSelUpdateNodeData?.routing.request) {

                    onSelUpdateNodeData.routing.request.body = { node: _node };

                    const response = await api.execute({
                        request: onSelUpdateNodeData.routing.request
                    });

                    const data = response.data;
                    
                    Object.keys(data).map(key => {
                        if (Object.hasOwn(node.data, key)) {
                            const newData = {[key]: data[key]};
                            updateNodeData(node.id, newData);
                        }
                    })
                }
            }
        }, [
            node
        ]
    );

    const handleChangeText = useCallback(
        async (
            value: IDataObject, 
            _: Extract<INodeProperties, { type: 'string' }>
            ) => {
            updateNodeParameters(node.id, value);
        }, [
            node
        ]
    );

    switch (property.type) {
        case 'options':
            return <NodeOptionsProperty key={`${property.type}.${property.name}`} property={property} handleSelect={handleOptionsSelect} node={node}/>
        case 'string':
            return <NodeStringProperty key={`${property.type}.${property.name}`} property={property} handleChangeText={handleChangeText}/>
        case 'resourceMapper': 
                return <NodeResourceMapperProperty key={`${property.type}.${property.name}`} property={property}/>
        default:
            return <div key={`${property.type}.${idx}`}></div>
    }
}

export function NodeProperty({
    properties,
    mode,
    node
}: {
    properties: INodeProperties[],
    mode: 'node' | 'panel',
    node: INode
}) {
    return (
        <>
        {properties.map((property, idx) => {
                if ((mode === 'node' && property.displayInNode) || (mode === 'panel')) {
                    return <RenderProperties property={property} idx={idx} key={idx} node={node}/>
                }
            }
        )}
        </>
    )
}