import React from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { api } from "@/server/server.service";
import type { INodeTypeDescription } from "nmg8-workflow";
import { useAddNodeOnEdgeDropStore } from "@/stores/add-node-on-edge-drop-store";
import { useShallow } from "zustand/react/shallow";

export function NodeCommandDialog({
    addNode
}: {
    addNode: (name: string) => Promise<void>
}) {
    const [
        open,
        setOpen
    ] = useAddNodeOnEdgeDropStore(
        useShallow((s) => [
            s.showMenu,
            s.actions.setShowMenu
        ])
    );

    const [search, setSearch] = React.useState('');
    const [nodes, setNodes] = React.useState<Partial<INodeTypeDescription>[]>([]);

    React.useEffect(() => {
        const getNodes = async () => {
            const response = await api.getNodes();
            setNodes(response.data.nodes);
        }
        getNodes();
    }, []);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.preventDefault()
                setOpen(true)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [setOpen]);

    return (
        <>
            <CommandDialog className='bg-popover' open={open} onOpenChange={setOpen}>
                <CommandInput className='m-2' value={search} placeholder="Procurar Nós" onValueChange={setSearch} />
                <CommandList className='border-none text-primary p-2'>
                    <CommandEmpty>Nenhum resultado encontrado!</CommandEmpty>
                    <CommandGroup className="" heading="Nós">
                        {nodes.map(node => (
                            <div key={node.name}>
                                <button className="w-full" onClick={() => { 
                                    if (node.name) addNode(node.name); 
                                    setOpen(false); 
                                }}>
                                    <CommandItem className='text-primary'>
                                        <span>{node.name}</span>
                                        <span>{node.description}</span>
                                    </CommandItem>
                                </button>
                            </div>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
