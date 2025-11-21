"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Node } from "@xyflow/react";
import { ArrowLeft } from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { BaseNodeData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { INodeProperties, INodeTypeDescription } from "@nmg8/workflow/src";
import ScriptSelector from "./panel/script-selector";
import { api } from "@/server/server.service";
<<<<<<< Updated upstream
=======
import type { INode } from "@/interfaces";
import type { INodeExecutionData, INodeProperties, INodeTypeDescription } from "nmg8-workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonViewMain } from "@/components/json-view/json-view";
>>>>>>> Stashed changes

interface INodePanelProps {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
<<<<<<< Updated upstream
    node: Node<BaseNodeData, string> | undefined;
=======
>>>>>>> Stashed changes
    onClose: () => void;
}

const RenderParam = memo(({ property }: { property: INodeProperties }) => {
    switch (property.type) {
        case "scriptSelector":
            return <ScriptSelector />
        default:
            return null;
    }
});


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
    const [nodeIputRunData, setNodeIputRunData] = useState<INodeExecutionData[]>();

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
            
            const inputs: INodeExecutionData[]  = [];
            for (const node of connectedEdges){
                const data = getNodeRunDataOutput(node.source);
                if (!data) continue;
                inputs.push(data);
            };
            setNodeIputRunData(inputs);
        }
    }, [nodeClicked, edges, lastRun, setNodeIputRunData]);

    const renderParams = useCallback(() => {
        if (!description) return null;

        return (
            <>
                {description.properties.map((property, index) => <RenderParam key={index} property={property}/>)}
            </>
        )

    }, [description?.properties]);

    const handleLoadDescription = useCallback(async () => {
<<<<<<< Updated upstream
        if (!node) return;
        const _description = (await api.getNodeDescription({type: node.data.parameters.type})).data;
=======
        if (!nodeClicked) return;
        const _description = (await api.getNodeDescription({name: nodeClicked.data.parameters.type})).data;
>>>>>>> Stashed changes
        setDescription(_description);
    }, [nodeClicked?.data.parameters.type]);

    useEffect(() => {
        handleLoadDescription();
    }, [handleLoadDescription])

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
                        <div className="bg-background w-full h-full mt-6 p-4 rounded-l-2xl">
                            <h1 className="text-primary">Entrada</h1>
                            <ScrollArea className='h-full w-full'>
                                <JsonViewMain
                                    inputProps={{
                                        className: "w-auto border-border rounded"
                                    }}
                                    data={nodeIputRunData || {}}
                                />
                            </ScrollArea>
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
                                        {renderParams()}
                                    </TabsContent>
                                    <TabsContent value="b">Configurações</TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </Panel>
                    <PanelResizeHandle hitAreaMargins={{ coarse: 40, fine: 20 }} />
                    <Panel defaultSize={30} minSize={20}>
                        <div className="bg-background w-full h-full mt-6 p-4 rounded-r-2xl">
                            <h1 className="text-primary">Saída</h1>
                            <ScrollArea className='h-full w-full'>
                                <JsonViewMain
                                    inputProps={{
                                        className: "w-auto border-border rounded"
                                    }}
                                    data={nodeRunData || {}}
                                />
                            </ScrollArea>
                        </div>
                    </Panel>
                </PanelGroup>
            </DialogContent>
        </ Dialog>
    )
})