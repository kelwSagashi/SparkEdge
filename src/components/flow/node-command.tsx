import React from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Button } from "../ui/button";

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
            if (e.key === " " && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [setOpen]);

    return (
        <>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-opacity-50 text-xs px-2 py-1">
                <p className="text-secondary text-sm">
                    <kbd className="text-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border/30 px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                        <span className="text-xs">Ctrl + space</span>
                    </kbd>
                </p>
            </span>
            <CommandDialog className='bg-black' open={open} onOpenChange={setOpen}>
                <CommandInput className='' value={search} placeholder="Digite algo" onValueChange={setSearch} />
                <CommandList className='border-none'>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Ações">
                        <CommandItem className='text-primary'>
                            <Button onClick={() => { addNode(); setOpen(false); }}>

                                <span>Script</span>
                            </Button>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
