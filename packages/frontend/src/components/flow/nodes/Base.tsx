import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Handle, Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Code2, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { type BaseNodeData, type RegisterNodeMetadata } from "./types";
import { useDeleteNode } from "@/hooks/use-delete-node";
import { BuilderNodeValues, NodeGroupTypes } from "@nmg8/workflow/src/constants";
import BaseNodeActions from "./Node-Actions";
import { NodePanel } from "./panel";
import { type INodeTypeDescription } from "@nmg8/workflow/src";
import BaseInputHandle from "./base-input-handle";
import BaseOutputHandle from "./base-output-handle";


type IbaseNodeProps = NodeProps<
    Node<BaseNodeData, string>
>;

const NODE_HANDLE_SIZE_GAP = 2;
const NODE_HANDLE_SIZE = 4;
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
}: IbaseNodeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [label, setLabel] = useState(data.name);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [description, setDescription] = useState<INodeTypeDescription>();
    const { getNode } = useReactFlow();
    const deleteNode = useDeleteNode();
    const nodeSize = useMemo(() => {
        let size = calc_node_base_size(NODE_HANDLE_SIZE, NODE_BASE_SIZE_MULTIPLIER, NODE_HANDLE_SIZE_GAP);
        if (!description) {
            return {
                w: `calc(var(--spacing) * ${size})`,
                h: `calc(var(--spacing) * ${size})`,
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
        }

    }, [description])

    const handleRun = useCallback(() => {
        console.log(getNode(id));
        data.onExecute();
    }, [id, data]);

    const handleLabelBlur = useCallback(() => {
        setIsEditingLabel(false);
    }, []);

    const handleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLabel(e.target.value);
        },
        []
    );

    const handleLoadDescription = useCallback(async () => {
        const res = await fetch(`http://localhost:3000/api/nodes/${data.parameters.type}/description`);
        const _description = await res.json() as INodeTypeDescription;
        setDescription(_description);
    }, [data.parameters.type]);

    useEffect(() => {
        handleLoadDescription();
    }, [handleLoadDescription])

    return (
        <div className="relative">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bottom-0 relative"
            >
                {isHovered && description?.defaults.handleActions && <BaseNodeActions deleteNode={() => deleteNode(id)} handleRun={handleRun} />}

                <div
                    className={cn("relative shadow-md",
                        "border-primary/80 rounded-xl bg-foreground flex",
                        "items-center justify-center cursor-pointer border-2",
                        selected ? "ring-8" : "")}
                    style={{
                        width: nodeSize.w,
                        height: nodeSize.h
                    }}
                    onDoubleClick={() => setIsDialogOpen(true)}
                >

                    {/* Handle de entrada */}
                    <BaseInputHandle
                        gap={NODE_HANDLE_SIZE_GAP}
                        size={NODE_HANDLE_SIZE}
                        inputs={data.inputs}
                    />

                    {/* Handle de saída */}
                    <BaseOutputHandle 
                        data={data}
                        outputs={data.outputs}
                        gap={NODE_HANDLE_SIZE_GAP}
                        size={NODE_HANDLE_SIZE}
                    />

                    {/* Ícone central */}
                    <Code2 className="h-10 w-10 text-primary" />
                </div>

                {/* === LABEL FORA DO NÓ === */}
                <div className="relative text-center mt-2">
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
                </div>
            </div>
        </div>
    );
}

export const BaseNodeMetadata: RegisterNodeMetadata<BaseNodeData> = {
    group: NodeGroupTypes.BASE,
    types: BuilderNodeValues,
    node: memo(BaseNode),
    selected: false,
    deletable: true,
    available: true
};