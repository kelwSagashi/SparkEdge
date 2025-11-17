import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { NodeResizeControl, NodeResizer, ResizeControlVariant, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useDeleteNode } from "@/hooks/use-delete-node";
import { BuilderNodes, type IDataObject, type INodeData, type INodeInputConfiguration, type INodeOutputConfiguration, type INodeProperties, type INodeTypeDescription } from "nmg8-workflow";
import BaseNodeActions from "./Node-Actions";
import BaseInputHandle from "./base-input-handle";
import BaseOutputHandle from "./base-output-handle";
import { api } from "@/server/server.service";
import type { IBaseNodeProps, INode, RegisterNodeMetadata } from "@/interfaces/nodes";
import NodeOptionSelector from "./properties/options-selector";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useShallow } from "zustand/react/shallow";
import NodeTextOption from "./properties/string-type";

const NODE_HANDLE_SIZE_GAP = 3;
const NODE_HANDLE_SIZE = 3;
const NODE_BASE_SIZE_MULTIPLIER = 3;
const calc_node_base_size = (
    size: number,
    multiplier: number,
    gap: number = 0
) => (size + 1) * multiplier + (gap + 1) * multiplier;

export default function BaseNode({
    id,
    data,
    selected
}: IBaseNodeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [description, setDescription] = useState<INodeTypeDescription>();
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
    const deleteNode = useDeleteNode();
    const nodeSize = useMemo(() => {
        let size = calc_node_base_size(NODE_HANDLE_SIZE, NODE_BASE_SIZE_MULTIPLIER, NODE_HANDLE_SIZE_GAP);
        if (!description) {
            return {
                w: `calc(var(--spacing) * ${size})`,
                h: `calc(var(--spacing) * ${size})`,
                width: size,
                height: size
            }
        }

        let multiplier = NODE_BASE_SIZE_MULTIPLIER;

        if (Array.isArray(description.inputs) && description.inputs.length > multiplier)
            multiplier = description.inputs.length;
        if (Array.isArray(description.outputs) && description.outputs.length > multiplier)
            multiplier = description.outputs.length;

        size = calc_node_base_size(NODE_HANDLE_SIZE, multiplier, NODE_HANDLE_SIZE_GAP);

        return {
            w: `calc(var(--spacing) * ${size})`,
            h: `calc(var(--spacing) * ${size})`,
            width: size,
            height: size
        }

    }, [description]);

    const handleRun = useCallback(async () => {
        const node = getNode(id) as INode;
        console.log(node);
    }, [id]);

    const handleOptionsSelect = useCallback(
        async (
            value: IDataObject, 
            property: Extract<INodeProperties, { type: 'options' }>
            ) => {
            updateNodeParameters(id, value);

            const node = getNode(id);

            if (!node) return;

            for (const onSel of property.onSelect ?? []) {
                const onSelUpdateNodeData = onSel.updateNodeData;

                if (onSelUpdateNodeData?.routing.request) {

                    onSelUpdateNodeData.routing.request.body = { node };

                    const response = await api.execute({
                        request: onSelUpdateNodeData.routing.request
                    });

                    const data = response.data;
                    
                    Object.keys(data).map(key => {
                        if (Object.hasOwn(node.data, key)) {
                            const newData = {[key]: data[key]};
                            updateNodeData(id, newData);
                        }
                    })
                }
            }
        }, [
            id
        ]
    );

    const handleChangeText = useCallback(
        async (
            value: IDataObject, 
            _: Extract<INodeProperties, { type: 'string' }>
            ) => {
            updateNodeParameters(id, value);
        }, [
            id
        ]
    );
    
    const handleLoadDescription = useCallback(async () => {
        const _description = (await api.getNodeDescription({name: data.name})).data;
        setDescription(_description);
    }, [data.type]);

    useEffect(() => {
        handleLoadDescription();
    }, [handleLoadDescription]);

    const minHeight = 140 + nodeSize.height;

    return (
            <NodeCard
                style={{
                    minWidth: 200,
                    minHeight
                }}
                data-selected={selected}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <NodeResizeControl minWidth={200} position="right" variant={ResizeControlVariant.Line} color="transparent"/>
                <NodeResizeControl minWidth={200} position="left" variant={ResizeControlVariant.Line} color="transparent"/>
                {isHovered && description?.defaults.handleActions && <BaseNodeActions deleteNode={() => deleteNode(id)} handleRun={handleRun} />}

                <NodeHeader>
                    {description?.displayName ?? "Node"}
                </NodeHeader>

                <div>
                    <div className="relative w-full h-full">
                        <BaseOutputHandle 
                            data={data}
                            outputs={data.outputs}
                            gap={NODE_HANDLE_SIZE_GAP}
                            size={NODE_HANDLE_SIZE}
                        />
                    </div>
                    <div className="relative p-2">
                        {description?.properties.map(property => {
                            switch (property.type) {
                                case 'options':
                                    return <NodeOptionSelector key={`${property.type}.${property.name}`} property={property} handleSelect={handleOptionsSelect}/>
                                case 'string':
                                    return <NodeTextOption key={`${property.type}.${property.name}`} property={property} handleChangeText={handleChangeText}/>
                                default:
                                    return <></>
                            }
                        }
                        )}
                    </div>
                    <div className="relative w-full h-full">
                        <BaseInputHandle
                            gap={NODE_HANDLE_SIZE_GAP}
                            size={NODE_HANDLE_SIZE}
                            inputs={data.inputs}
                        />
                    </div>
                </div>

                {/*
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center mt-2">
                    {isEditingLabel ? (
                        <input
                            value={label}
                            onChange={handleLabelChange}
                            onBlur={handleLabelBlur}
                            autoFocus
                            className="w-[100px] text-sm text-center bg-transparent border-b border-muted-foreground outline-none text-foreground"
                        />
                    ) : (
                        <span
                            className="text-sm font-medium text-primary cursor-text"
                            onDoubleClick={() => setIsEditingLabel(true)}
                        >
                            {label}
                        </span>
                    )}
                </div> */}
            </NodeCard>
        
    );
}

export const BaseNodeMetadata: RegisterNodeMetadata<INodeData> = {
    types: ["base"],
    node: memo(BaseNode),
    selected: false,
    deletable: true,
    available: true,
};

const NodeCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
        "rounded-sm shadow-lg !h-full h-min-0 w-full ",
        "text-white border border-black/60",
        "data-[selected=true]:ring-1 !bg-neutral-900",
        className
    )}
    {...props}
  />
));
NodeCard.displayName = "NodeCard";

const NodeHeader = React.forwardRef<
  HTMLDivElement ,
  React.HTMLAttributes<HTMLDivElement> & {text?: string}
>(({ className, text, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
        "bg-emerald-700 text-white px-3 py-1 flex items-center",
        "justify-between cursor-pointer select-none rounded-t-sm",
        className
    )}
    {...props}
  >
    <span className="font-semibold text-sm truncate">
        {children}
        {text}
    </span>
  </div>
));
NodeHeader.displayName = "NodeHeadder";