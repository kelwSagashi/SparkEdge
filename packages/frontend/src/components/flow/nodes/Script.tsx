import { memo, useCallback, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Code2, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { BuilderNodes, type BaseNodeData, type RegisterNodeMetadata } from "./types";
import { useDeleteNode } from "@/hooks/use-delete-node";

const NODE_TYPE = BuilderNodes.SCRIPT;
export interface ScriptNodeData extends BaseNodeData {
};

type ScriptNodeProps = NodeProps<
    Node<ScriptNodeData, typeof NODE_TYPE>
>;

export default function ScriptNode({
    id,
    data,
    selected
}: ScriptNodeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [label, setLabel] = useState(data.label || "Script");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const deleteNode = useDeleteNode();

    const handleRun = useCallback(() => {
        console.log("run");
    }, []);

    const handleLabelBlur = useCallback(() => {
        setIsEditingLabel(false);
    }, []);

    const handleLabelChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLabel(e.target.value);
        },
        []
    );

    return (
        <div className="relative">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bottom-0 relative"
            >
                {/* Botões de ação */}
                {isHovered && (
                    <div
                        className="absolute -top-10 flex space-x-2 z-10 h-[50px]"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Button size="icon" variant="secondary" className="h-7 w-7 p-1" onClick={handleRun}>
                            <Play className="h-4 w-4 text-primary" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7 p-1" onClick={() => deleteNode(id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7 p-1">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                )}

                {/* === NÓ PRINCIPAL === */}

                <div
                    className={cn("relative w-[100px] h-[100px] shadow-md",
                        "border-primary/80 rounded-xl bg-foreground flex",
                        "items-center justify-center cursor-pointer border-2",
                        selected ? "ring-8" : "")}
                    onDoubleClick={() => setIsDialogOpen(true)}
                >

                    {/* Handle de entrada */}
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="!w-2.5 !h-6 !bg-primary !rounded-[2px] !border-none"
                    />

                    {/* Handle de saída */}
                    <Handle
                        type="source"
                        position={Position.Right}
                        className={cn(
                            "absolutecursor-crosshair",
                            "size-3 hover:border-primary/50  border-2 border-card-foreground/40",
                            ""
                        )}
                        onDragEnd={() => {
                            console.log("end")
                        }}

                    >
                        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 flex items-center">
                            <span className="left-5 bg-background/70 p-0.5 absolute text-xs font-light text-primary">Saída</span>
                            <div className="hover:bg-accent-foreground w-[16px] h-[16px] bg-muted-foreground rounded-full" />
                        </div>
                        <div className={cn(
                            "absolute left-[-6px] top-1/2 -translate-y-1/2 flex items-center",
                            "transition-all ease-linear duration-100",
                            !data.isConnecting ? "scale-x-100 scale-y-100 opacity-100" : "scale-x-0 scale-y-0 opacity-0")}>
                            <>
                                <div className="w-18 h-[2px] bg-muted-foreground" />
                                <span className="!w-6 !h-6 !bg-none border-3 border-muted-foreground hover:border-accent-foreground !rounded relative flex items-center justify-center">
                                    <span className="absolute text-sm font-bold text-primary">+</span>
                                </span>
                            </>
                        </div>
                    </Handle>

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

                {/* === DIALOG DE EDIÇÃO === */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Configurações do Nó: {label}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Aqui você poderá editar as propriedades e o script deste nó.
                            </p>
                            <textarea
                                placeholder="Digite o código aqui..."
                                className="w-full h-40 p-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                defaultValue={data.onChange ? "" : "// seu código aqui"}
                            />
                            <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export const ScriptNodeMetadata: RegisterNodeMetadata<ScriptNodeData> = {
    type: BuilderNodes.SCRIPT,
    node: memo(ScriptNode),
    connection: {
        inputs: 1,
        outputs: 1,
    },
    available: false,
    defaultData: {
        label: "Script",
        deletable: true,
    },
    selected: false
};
