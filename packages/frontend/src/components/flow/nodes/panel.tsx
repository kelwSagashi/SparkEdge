"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Node } from "@xyflow/react";
import { ArrowLeft } from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NodeOptionsProperty from "./properties/options-selector";
import { api } from "@/server/server.service";
import type { INodeProperties } from "nmg8-workflow";
import type { INode } from "@/interfaces";
import type { INodeExecutionData, INodeTypeDescription } from "nmg8-workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { JsonViewMain } from "@/components/json-view/json-view";
import { NodeProperty } from "./properties/properties";

interface INodePanelProps {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
}

export const NodePanel: React.FC<INodePanelProps> = React.memo(({
    isDialogOpen,
    setIsDialogOpen,
    onClose
}) => {
    const [
        getNodeRunDataOutput,
        nodeClicked,
        edges,
        lastRun,
    ] = useWorkflowStore(useShallow(s => [
        s.getNodeRunData,
        s.nodeClicked,
        s.workflow.edges,
        s.lastRun
    ]))
    const [description, setDescription] = useState<INodeTypeDescription>();
    const [nodeRunData, setNodeRunData] = useState<INodeExecutionData>();
    const [nodeIputRunData, setNodeIputRunData] = useState<Record<string, INodeExecutionData>>();

    useEffect(() => {
        if (nodeClicked?.id) {
            console.log(getNodeRunDataOutput(nodeClicked.id))
            setNodeRunData(getNodeRunDataOutput(nodeClicked.id));
        }
    }, [nodeClicked, getNodeRunDataOutput]);

    useEffect(() => {
        if(nodeClicked) {
            const connectedEdges = edges.filter(edge => edge.target === nodeClicked.id);
            console.log(connectedEdges, lastRun)
            
            const inputs: Record<string, INodeExecutionData>  = {};
            for (const node of connectedEdges){
                const data = getNodeRunDataOutput(node.source);
                if (!data) continue;
                inputs[node.sourceHandle || node.source] = (data);
            };
            setNodeIputRunData(inputs);
        }
    }, [nodeClicked, edges, lastRun, setNodeIputRunData]);


    const handleLoadDescription = useCallback(async () => {
        if (!nodeClicked) return;
        const _description = (await api.getNodeDescription({name: nodeClicked.data.name})).data;
        setDescription(_description);

        _description.properties.forEach(item => {
            
        })
    }, [nodeClicked]);

    useEffect(() => {
        handleLoadDescription();
    }, [handleLoadDescription])

    useEffect(() => {console.log('panel', description)}, [description])

    return (

        <Dialog modal open={isDialogOpen} onOpenChange={setIsDialogOpen} >
            <DialogContent showCloseButton={false} className="rounded-none bg-foreground/80 sm:w-full sm:max-w-full w-full h-full flex flex-col">
                <DialogTitle className="text-primary">
                </DialogTitle>
                <DialogClose onClick={onClose} data-slot="dialog-close" className="flex align-middle items-center text-primary absolute top-4 left-4 rounded-xs transition-opacity hover:opacity-100 cursor-pointer  [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                    <ArrowLeft />
                    Voltar
                </DialogClose>
                <PanelGroup className="h-full" direction="horizontal">
                    <Panel defaultSize={30} minSize={20}>
                        <div className="bg-background w-full h-full mt-6 p-4 rounded-l-2xl flex flex-col">
                            <div>
                                <h1 className="text-primary">Entrada</h1>
                            </div>
                            <div className="flex-1 overflow-auto mb-6">
                            <ScrollArea className='h-full w-full flex overflow-auto' >
                                <div>
                                <JsonViewMain
                                    className=""
                                    inputProps={{
                                        className: "w-auto border-border rounded ",
                                        disabled: true,
                                    }}
                                    data={nodeIputRunData || {}}
                                />
                                </div>
                                <ScrollBar orientation="vertical"/>
                                <ScrollBar orientation="horizontal"/>
                            </ScrollArea>
                            </div>
                        </div>
                    </Panel>
                    <PanelResizeHandle hitAreaMargins={{ coarse: 40, fine: 20 }} className="" />
                    <Panel minSize={30}>
                        <div className="bg-background w-full h-full border-border border rounded-t-2xl">
                            <div className="bg-muted-foreground/30 w-full h-full p-4 rounded-t-2xl">
                                <h1 className="text-primary">{nodeClicked?.data.name}</h1>
                                <Tabs defaultValue="a" className="py-2">
                                    <TabsList>
                                        <TabsTrigger value="a">Parâmetros</TabsTrigger>
                                        <TabsTrigger value="b">Configurações</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="a">
                                        {description && nodeClicked && (
                                            <>
                                                <h1 className={"text-amber-50"}>TETSE</h1>
                                                <NodeProperty mode="panel" node={nodeClicked} properties={description?.properties} />
                                            </>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="b">Configurações</TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </Panel>
                    <PanelResizeHandle hitAreaMargins={{ coarse: 40, fine: 20 }} />
                    <Panel defaultSize={30} minSize={20}>
                        <div className="bg-background w-full h-full mt-6 p-4 rounded-r-2xl flex flex-col">
                            <div>
                                <h1 className="text-primary">Saída</h1>
                            </div>
                            <div className="flex-1 overflow-auto mb-6">
                                <ScrollArea className='h-full w-full flex overflow-auto'>
                                    <div>
                                        <JsonViewMain
                                            inputProps={{
                                                className: "w-auto border-border rounded",
                                                disabled: true
                                            }}

                                            data={nodeRunData || {}}
                                        />
                                    </div>
                                    <ScrollBar orientation="vertical"/>
                                    <ScrollBar orientation="horizontal"/>
                                </ScrollArea>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </DialogContent>
        </ Dialog>
    )
})