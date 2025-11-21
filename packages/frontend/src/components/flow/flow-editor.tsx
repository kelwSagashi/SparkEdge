/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Controls, Background, MiniMap, type Node, type NodeChange, type Connection, type Edge, type EdgeChange, SelectionMode, useReactFlow, type EdgeTypes, type FinalConnectionState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '@radix-ui/react-separator';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Copy, Download, MoreVertical, Play, Save, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { NodeCommandDialog } from './node-command';
import { useNodeAutoAdjust } from '@/hooks/use-node-auto-adjust';
import { FlowContextMenu } from './components/context-menu';
import CustomDeletableEdge from './edges/custom-deletable-edge';
import { useAddOnEdgeDrop } from '@/hooks/use-add-on-edge-drop';
import { useInsertNode } from '@/hooks/use-insert-node';
import { useDeleteNode } from '@/hooks/use-delete-node';
import { BuilderNodes } from 'nmg8-workflow';
import { NODE_TYPES } from './nodes';
import { NodePanel } from './nodes/panel';
import type { INode } from '@/interfaces';

const edgeTypes: EdgeTypes = {
    deletable: CustomDeletableEdge
}

export default function FlowEditor({ id }: { id: string | undefined }) {
<<<<<<< Updated upstream
    const [open, setOpen] = useState<boolean>(false);
    const [nodes, setNodes] = useState<INode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
=======
    const [
        workflow,
        nodes, 
        edges, 
        onNodesChangeState, 
        onEdgesChangeState, 
        onConnectState, 
        saveWorkflow, 
        loadWorkflow,
        shareWorkflow,
        duplicateWorkflow,
        downloadWorkflow,
        deleteNode,
        deleteEdge,
        setNodeClicked,
        setLastRun,
    ] = useWorkflowStore(
        useShallow((state) => [
            state.workflow,
            state.workflow.nodes,
            state.workflow.edges,
            state.onNodesChange,
            state.onEdgesChange,
            state.onConnect,
            state.saveWorkflow,
            state.loadWorkflow,
            state.shareWorkflow,
            state.duplicateWorkflow,
            state.downloadWorkflow,
            state.deleteNode,
            state.deleteEdge,
            state.setNodeClicked,
            state.setLastRun
        ])
    );
>>>>>>> Stashed changes

    const [openNodePanel, setOpenNodePanel] = useState(false);

    const { getNodes } = useReactFlow();

    const { handleOnEdgeDropConnectedEnd, handleOnEdgeConnectedStart } = useAddOnEdgeDrop()

    const autoAdjustNode = useNodeAutoAdjust();
    const insertNode = useInsertNode();
    const deleteNode = useDeleteNode();

    const handleAutoAdjustNodeAfterNodeMeasured = useCallback(
        (id: string) => {
            setTimeout(() => {
                const node = getNodes().find((n) => n.id === id);
                if (!node) {
                    return;
                }

                if (node.measured === undefined) {
                    handleAutoAdjustNodeAfterNodeMeasured(id);
                    return;
                }

                autoAdjustNode(node);
            });
        },
        [autoAdjustNode, getNodes]
    );

    const onNodesChange = useCallback(
        (changes: NodeChange<INode>[]) => {
            changes.forEach((change) => {
                if (change.type === "dimensions") {
                    const node = getNodes().find((n) => n.id === change.id);
                    if (node) {
                        autoAdjustNode(node);
                    }
                }

                if (change.type === "add") {
                    handleAutoAdjustNodeAfterNodeMeasured(change.item.id);
                }
            });
            setNodes((nodesSnapshot) => applyNodeChanges<INode>(changes, nodesSnapshot))
        },
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => {
            setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
        },
        [],
    );
    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((edgesSnapshot) => addEdge({ ...params, type: "deletable" }, edgesSnapshot)),
        [],
    );

    // const onUpdateNodeData = useCallback((nodeId: string, data: Record<string, unknown>) => {
    //     setNodes((nds) =>
    //         nds.map((node) =>
    //             node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    //         )
    //     );
    // }, [setNodes]);

    const onSaveFlow = useCallback(() => {
        const flowDefinition = {
            id: id,
            nodes,
            edges,
            name: `Fluxo`
        };
        console.log(`Salvando fluxo:`, JSON.stringify(flowDefinition, null, 2));
    }, [id, nodes, edges]);

    const addScriptNode = useCallback(() => {
        insertNode(BuilderNodes.SCRIPT)
    }, [insertNode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
                const selectedNodes = nodes.filter((n) => n.selected);
                if (selectedNodes.length > 0) {
                    selectedNodes.forEach((node) => deleteNode(node.id));
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nodes, deleteNode]);

    const handleRun = () => {
        console.log("Executando fluxo...");
    };

<<<<<<< Updated upstream
    const handleShare = () => {
        console.log("Compartilhando fluxo...");
    };

    const handleDuplicate = () => {
        console.log("Duplicando projeto...");
    };

    const handleDownload = () => {
        console.log("Baixando projeto...");
    };
=======
        const response = await api.runWorkflowTest({workflow});

        setLastRun(response.data);
    }, [workflow]);
>>>>>>> Stashed changes

    return (
        <>
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
                <FlowContextMenu>
                    <ReactFlow
                        proOptions={{ hideAttribution: true }}
                        onInit={({ fitView }) => fitView().then()}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={NODE_TYPES}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onConnectStart={handleOnEdgeConnectedStart}
                        onConnectEnd={handleOnEdgeDropConnectedEnd}
                        selectionMode={SelectionMode.Full}
                        multiSelectionKeyCode="Control"
                        selectionOnDrag={true}
                        selectionKeyCode={null}
                        onNodeDragStop={(_, node) => {
                            autoAdjustNode(node);
                        }}
                        onNodeDoubleClick={(e, node) => {
                            setOpenNodePanel(true);
                            setNodeClicked(node);
                        }}
                        snapGrid={[16, 16]}
                        snapToGrid
                        fitView
                        className="react-flow-dark-theme"
                    >
                        <MiniMap
                            position="bottom-right"
                            nodeStrokeColor={(n) => {
                                if (n.type === 'script') return 'hsl(var(--primary))';
                                if (n.type === 'output') return 'hsl(var(--destructive))';
                                if (n.type === 'modbusRead' || n.type === 'apiCall') return 'hsl(var(--accent))';
                                return 'hsl(var(--card))';
                            }}
                            nodeColor={(n) => {
                                if (n.type === 'script') return 'hsl(var(--primary))';
                                if (n.type === 'output') return 'hsl(var(--destructive))';
                                if (n.type === 'modbusRead' || n.type === 'apiCall') return 'hsl(var(--accent))';
                                return 'hsl(var(--card))';
                            }}
                            maskColor="hsl(var(--muted))"
                        />
                        <Controls position="top-left" />
                        <Background gap={12} size={1} />
                    </ReactFlow>
                </FlowContextMenu>

                <NodePanel
                    isDialogOpen={openNodePanel}
                    setIsDialogOpen={setOpenNodePanel}
                    onClose={() => {
                        setOpenNodePanel(false);
                        setNodeClicked(undefined)
                    }}
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm shadow-lg rounded-2xl border border-border px-4 py-2 flex items-center gap-3 z-50">
                    <Button size="sm" onClick={handleRun}>
                        <Play className="h-4 w-4 mr-1" />
                        Executar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onSaveFlow}>
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
        </>
    );
}