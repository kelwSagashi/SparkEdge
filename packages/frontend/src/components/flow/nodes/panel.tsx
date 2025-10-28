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

interface INodePanelProps {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    node: Node<BaseNodeData, string> | undefined;
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
    onClose,
    node
}) => {
    const [description, setDescription] = useState<INodeTypeDescription>();

    const renderParams = useCallback(() => {
        if (!description) return null;

        return (
            <>
                {description.properties.map((property, index) => <RenderParam key={index} property={property}/>)}
            </>
        )

    }, [description?.properties]);

    const handleLoadDescription = useCallback(async () => {
        if (!node) return;
        const res = await fetch(`http://localhost:3000/api/nodes/${node.data.parameters.type}/description`);
        const _description = await res.json() as INodeTypeDescription;
        setDescription(_description);
    }, [node?.data.parameters.type]);

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
                        </div>
                    </Panel>
                    <PanelResizeHandle hitAreaMargins={{ coarse: 40, fine: 20 }} className="" />
                    <Panel minSize={30}>
                        <div className="bg-background w-full h-full border-border border rounded-t-2xl">
                            <div className="bg-muted-foreground/30 w-full h-full p-4 rounded-t-2xl">
                                <h1 className="text-primary">{node?.data.name}</h1>
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
                        </div>
                    </Panel>
                </PanelGroup>
            </DialogContent>
        </ Dialog>
    )
})