import React from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

export function NodeCommandDialog({
    open,
    setOpen,
    addNode
}: {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    addNode: () => void
}) {
    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === " "
                // && (e.metaKey || e.ctrlKey)
            ) {
                e.preventDefault()
                setOpen((open) => !open)
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
                        <button className="w-full" onClick={() => { addNode(); setOpen(false); }}>
                            <CommandItem className='text-primary'>
                                <span>Script</span>
                            </CommandItem>
                        </button>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
