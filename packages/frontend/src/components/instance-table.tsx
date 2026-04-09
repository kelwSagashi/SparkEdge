import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import React from "react";
import { useWorkflowExecutionsStore } from '@/stores/workflow-executions-store';
import { Button } from "./ui/button";
import { Spinner } from './ui/spinner';
import { ArrowUpDown, ChevronDown, MoreVertical, Pause, RotateCcw, SquareStopIcon, Trash } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import Search from "./search";
import { useNavigate } from "react-router-dom";
import type { WorkflowExecutionReturningValues } from "nmg8-db/src/types";
import { useShallow } from "zustand/react/shallow";

type InstanceType = WorkflowExecutionReturningValues;

const HeaderColumn = ({
    title,
    column
}: {
    title: string, column: ColumnDef<InstanceType, unknown>
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };
    return (
        <div className="inline-flex items-center w-full justify-between"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="text-primary text-right font-medium">{title}</div>
            {isHovered && (
                <Button
                    variant={"ghost"}
                    className="rounded-full hover:bg-primary-foreground text-primary hover:text-primary/60"
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown />
                </Button>
            )}
        </div>
    )
}

const columns: ColumnDef<InstanceType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: () => {
            return <></>
        },
        cell: ({ row }) => {
            const status = row.getValue("status");
            const active = status === 'running' || status === 'idle';
            return (
                <div className="p-2">
                    <div className={`w-3 h-3 rounded-full ${active ? "bg-green-900" : "border border-primary-foreground"}`} />
                </div>
            )
        },
    },
    {
        accessorKey: "workflow_id",
        header: ({ column }) => {
            return <HeaderColumn title="Workflow" column={column} />
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("workflow_id")}</div>
        ),
    },
    {
        accessorKey: "id",
        header: ({ column }) => {
            return <HeaderColumn title="Id" column={column} />
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "mode",
        header: () => {
            return <div className="text-primary font-medium">Mode</div>
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("mode")}</div>
        ),
    },
    {
        accessorKey: "wait_till",
        header: () => {
            return <div className="text-primary font-medium">Scheduled</div>
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("wait_till") ?? '—'}</div>
        ),
    },
    {
        accessorKey: "started_at",
        header: () => {
            return <div className="text-primary font-medium">Last start</div>
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("started_at") ?? '—'}</div>
        ),
    },
    {
        accessorKey: "enabled",
        header: () => {
            return <div className="text-primary font-medium">Enabled</div>
        },
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("enabled") ? 'Yes' : 'No'}</div>
        ),
    },
];


export default function InstanceTable() {
    const navigate = useNavigate();
    const [ 
        executions,
        loadAll,
        trigger,
        setEnabled,
        remove,
        loading
    ] = useWorkflowExecutionsStore(
        useShallow((s) => [
            s.executions,
            s.loadAll,
            s.trigger,
            s.setEnabled,
            s.remove,
            s.loading
        ])
    );
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const handleNavigateToEditor = (id: string) => {
        navigate(`/workflow/${id}`);
    };

    React.useEffect(() => {
        loadAll();
    }, [loadAll]);

    const showPauseButton = React.useMemo(() => { return Object.entries(rowSelection).length > 0 }, [rowSelection]);

    // override data used by table
    const table = useReactTable({
        data: executions,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <section className="mt-4">

            <div className="flex flex-row justify-between items-stretch">
                <div className="flex gap-2">
                    <Search
                        value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
                        onChange={(event) => {
                            table.getColumn("id")?.setFilterValue(event.target.value)
                        }}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="ml-auto text-primary hover:text-primary">
                                Colunas <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background text-primary">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div>
                    {showPauseButton && (
                        <>
                            <Button className="bg-primary-foreground hover:bg-primary-foreground/45 rounded-none">
                                <SquareStopIcon size={40} color="white" />
                            </Button>
                            <Button className="bg-primary-foreground hover:bg-primary-foreground/45 rounded-none">
                                <Pause size={40} color="white" />
                            </Button>
                        </>
                    )}
                </div>
                <div>
                    {/* <InstanceForm /> */}
                </div>
            </div>
            <section className="mt-4">
                <div className="relative">
                    <div className="absolute overflow-x-hidden w-full">
                        <div className="flex flex-row">
                            <div className="w-full">
                                <Table className="">
                                    <TableHeader className="[&_tr]:border-b-primary-foreground/60">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow className="hover:bg-background" key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => {
                                                    return (
                                                        <TableHead key={header.id}>
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </TableHead>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}

                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    onClick={() => handleNavigateToEditor(row.getValue("id"))}
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                    className="border-b-primary-foreground data-[state=selected]:bg-primary-foreground/40 hover:bg-secondary-foreground"
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className="h-14 text-primary"
                                                        >
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columns.length}
                                                    className="h-24 text-center"
                                                >
                                                    No results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="">
                                <Table className="bg-primary-foreground/20">
                                    <TableHeader className="[&_tr]:border-b-primary-foreground/60">
                                        <TableRow >
                                            <TableHead className="text-primary">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                    className="border-b-primary-foreground data-[state=selected]:bg-primary-foreground/40 hover:bg-secondary-foreground"
                                                >
                                                    <TableCell key={"action"} className="h-14 hover:bg-transparent">
                                                        <Button disabled={loading} className="bg-transparent hover:bg-background/95 rounded-full" onClick={(e) => { e.stopPropagation(); trigger(row.getValue("id")) }}>
                                                            {loading ? <Spinner /> : <RotateCcw color="white" />}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button className="bg-transparent hover:bg-background/95 rounded-full">
                                                                    <MoreVertical color="white" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" side="left" className="bg-secondary-foreground">
                                                                <DropdownMenuItem
                                                                    className="text-primary focus:bg-primary-foreground"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(row.getValue("id"))
                                                                    }}
                                                                >
                                                                    Copiar ID
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-primary focus:bg-primary-foreground" onClick={(e) => { e.stopPropagation(); trigger(row.getValue("id")) }} disabled={loading}>
                                                                    <RotateCcw color="white" />
                                                                    Reiniciar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-primary focus:bg-primary-foreground" onClick={(e) => { e.stopPropagation(); setEnabled(row.getValue("id"), !row.getValue("enabled")) }} disabled={loading}>
                                                                    <Pause color="white" />
                                                                    {row.getValue("enabled") ? 'Desabilitar' : 'Habilitar'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button className="bg-transparent hover:bg-background/95 rounded-full" onClick={(e) => e.stopPropagation()}>
                                                                    <Trash color="white" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Essa ação não pode ser desfeita. Isso irá deletar
                                                                        permanentemente a instância.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); remove(row.getValue("id")) }} disabled={loading}>Continuar</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    // colSpan={columns.length}
                                                    className="h-24 text-center"
                                                >
                                                    Sem resultados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    )
}