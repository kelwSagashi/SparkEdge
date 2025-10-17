import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background, MiniMap, type Node, type NodeChange, type Connection, type Edge, type EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '@radix-ui/react-separator';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Copy, Download, MoreVertical, Play, Save, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import ScriptNode from './nodes/Script';
import { NodeCommandDialog } from './node-command';
import * as uuid from 'uuid';


const nodeTypes = {
    script: ScriptNode,
};

export default function FlowEditor() {
    const [open, setOpen] = useState<boolean>(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const addScriptNode = useCallback(() => {
        const id = uuid.v4();
        const newNode: Node = {
            id,
            type: "script",
            position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 100 },
            data: {
                code: "",
                onChange: (value: string) => {
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === id ? { ...n, data: { ...n.data, code: value } } : n
                        )
                    );
                },
                onRun: (code: string) => {
                    console.log("executar script:", code);
                },
            },
        };

        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    const handleRun = () => {
        console.log("Executando fluxo...");
    };

    const handleSave = () => {
        console.log("Salvando fluxo...");
    };

    const handleShare = () => {
        console.log("Compartilhando fluxo...");
    };

    const handleDuplicate = () => {
        console.log("Duplicando projeto...");
    };

    const handleDownload = () => {
        console.log("Baixando projeto...");
    };

    return (
        <div className="absolute inset-0 flex h-full w-full">
            <Sheet> {/* open e defaultOpen para ele iniciar sempre aberto */}
                <SheetContent side="left" className="w-64 sm:w-[300px] bg-background border-r border-border p-4 pt-8 z-50">
                    <SheetHeader>
                        <SheetTitle className="text-foreground text-xl">Nôs Disponíveis</SheetTitle>
                        <SheetDescription className="text-muted-foreground text-sm">
                            Arraste e solte nós no canvas para construir seu fluxo.
                        </SheetDescription>
                    </SheetHeader>
                    <Separator className="my-4" />
                    <ScrollArea className="h-[calc(100%-120px)]">

                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <NodeCommandDialog addNode={addScriptNode} open={open} setOpen={setOpen} />

            <div className="flex-grow h-full bg-background relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="react-flow-dark-theme"
                >
                    <MiniMap
                        position="bottom-right"
                        nodeStrokeColor={(n) => {
                            if (n.type === 'input') return 'hsl(var(--primary))';
                            if (n.type === 'output') return 'hsl(var(--destructive))';
                            if (n.type === 'modbusRead' || n.type === 'apiCall') return 'hsl(var(--accent))';
                            return 'hsl(var(--card))';
                        }}
                        nodeColor={(n) => {
                            if (n.type === 'input') return 'hsl(var(--primary))';
                            if (n.type === 'output') return 'hsl(var(--destructive))';
                            if (n.type === 'modbusRead' || n.type === 'apiCall') return 'hsl(var(--accent))';
                            return 'hsl(var(--card))';
                        }}
                        maskColor="hsl(var(--secondary))"
                    />
                    <Controls position="top-left" />
                    <Background gap={12} size={1} />
                </ReactFlow>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm shadow-lg rounded-2xl border border-border px-4 py-2 flex items-center gap-3 z-50">
                    <Button size="sm" onClick={handleRun}>
                        <Play className="h-4 w-4 mr-1" />
                        Executar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                    </Button>
                    <Button size="sm" variant="outline" className='text-primary' onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-1" />
                        Compartilhar
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-primary">
                            <DropdownMenuItem onClick={handleDuplicate}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicar projeto
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar projeto
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}