import React from 'react';
import { Input } from '../ui/input';
import { ArrowDownWideNarrow, Box, ChevronRight, Folder, Quote, Text } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';
import DraggableValue from '../DraggableValue';
import { ItemTypes } from '@/lib/constants';

export function JsonViewMain({
    className,
    mainClassName,
    data,
    onParamChange,
    inputProps,
    pProps,
    defaultExpandLevel = 2,
    icons,
    forceExpand = false,
    expandOnce = true,
    filter,
    ...props
}: React.ComponentProps<"div"> & {
    mainClassName?: string,
    data: Record<string, any>,
    onParamChange?: (name: string, param: string, value: string) => void;
    inputProps?: React.ComponentProps<"input">;
    pProps?: React.ComponentProps<"p">;
    defaultExpandLevel?: number;
    filter?: string,
    forceExpand?: boolean,
    expandOnce?: boolean,
    icons?: {
        object?: React.ReactNode;
        string?: React.ReactNode;
        number?: React.ReactNode;
        boolean?: React.ReactNode;
    };
}) {
    const [_expandOnce, setExpandOnce] = React.useState(expandOnce)

    const filteredData = React.useMemo(() => {
        if (!filter) return data;
        const lower = filter.toLowerCase();
        const filterRecursive = (obj: any): any => {
            if (typeof obj !== "object" || obj === null) return obj;
            const result: Record<string, any> = {};
            for (const [k, v] of Object.entries(obj)) {
                const matches = k.toLowerCase().includes(lower) || String(v).toLowerCase().includes(lower);
                if (matches) result[k] = v;
                else if (typeof v === "object") {
                    const child = filterRecursive(v);
                    if (Object.keys(child).length) result[k] = child;
                }
            }
            return result;
        };
        return filterRecursive(data);
    }, [data, filter]);

    return (
        <div className={cn('flex flex-col')}>
            <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden'>
                <div className='relative flex w-full min-w-0 flex-col p-2'>
                    <div className='w-full text-sm'>
                        <div className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props}>
                            {Object.entries(data).map(([name, value]) => (
                                <JsonView
                                    key={name}
                                    name={name}
                                    value={value}
                                    level={0}
                                    expandOnce={!_expandOnce}
                                    setExpandOnce={setExpandOnce}
                                    defaultExpandLevel={defaultExpandLevel}
                                    forceExpand={forceExpand}
                                    icons={icons}
                                    onParamChange={onParamChange}
                                    inputProps={inputProps}
                                    pProps={pProps}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export function JsonButtonView({
    className,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button className={
            cn('flex items-center gap-2 overflow-hidden',
                'rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring',
                'transition-[width,height,padding]',
                'focus-visible:ring-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'pointer-events-auto cursor-pointer aria-disabled:opacity-50',
                'data-[active=true]:font-medium',
                'group-data-[collapsible=icon]:size-8!',
                'group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                'text-primary',
                className
            )}
            {...props} />
    )
}

export function JsonView({
    name,
    value,
    level,
    defaultExpandLevel,
    forceExpand,
    icons,
    inputProps,
    pProps,
    expandOnce,
    setExpandOnce,
    onParamChange,
}: {
    name: string;
    value: any;
    level: number;
    defaultExpandLevel: number;
    forceExpand: boolean | null;
    expandOnce: boolean,
    setExpandOnce: React.Dispatch<React.SetStateAction<boolean>>,
    icons?: Record<string, React.ReactNode>;
    onParamChange?: (name: string, param: string, value: string) => void;
    inputProps?: React.ComponentProps<"input">;
    pProps?: React.ComponentProps<"p">;
}) {
    const isObject = typeof value === "object" && value !== null;

    const [open, setOpen] = React.useState(forceExpand ? forceExpand : level < defaultExpandLevel);

    const handleSetExpand = React.useCallback((value: boolean) => {
        setExpandOnce(false);
        setOpen(value);
    }, [expandOnce]);

    const icon =
        typeof value === "object"
            ? icons?.object ?? <Box className="w-4 h-4" />
            : typeof value === "string"
                ? icons?.string ?? <Quote className="w-4 h-4" />
                : typeof value === "number"
                    ? icons?.number ?? <span className="text-blue-400">#</span>
                    : typeof value === "boolean"
                        ? icons?.boolean ?? <span className="text-amber-400">⚙</span>
                        : null;

    if (!isObject) {
        return (
            <JsonButtonView
                className="w-80 data-[active=true]:bg-transparent"
            >
                <div className='w-full flex gap-2 items-center'>
                    <span className='bg-foreground p-2 rounded w-auto flex flex-row items-center justify-center gap-1'>
                        {icon}
                        {name}
                    </span>
                    {inputProps && <Input
                        defaultValue={value}
                        onChange={(e) => onParamChange?.("", name, e.target.value)}
                        {...inputProps}
                    />}
                    {pProps && (
                        <DraggableValue type={ItemTypes.OUTPUT_VALUE} isDropped={false} value={String(value)}>
                            <p {...pProps}>{String(value)}</p>
                        </DraggableValue>
                    )}
                </div>
            </JsonButtonView>
        )
    }
    return (
        <div className='relative'>
            <Collapsible
                open={open}
                onOpenChange={handleSetExpand}
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen={name === "components" || name === "ui"}
            >
                <CollapsibleTrigger asChild>
                    <JsonButtonView>
                        <ChevronRight className="transition-transform" />
                        {icon}
                        {name}
                    </JsonButtonView>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div
                        className={cn(
                            "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px",
                            "flex-col gap-1 border-l px-2.5 py-0.5",
                            "group-data-[collapsible=icon]:hidden"
                        )}
                    >
                        {Object.entries(value).map(([childName, childValue]) => (
                            <JsonView
                                key={childName}
                                name={childName}
                                value={childValue}
                                level={level + 1}
                                defaultExpandLevel={expandOnce ? 0 : defaultExpandLevel}
                                forceExpand={forceExpand && expandOnce}
                                icons={icons}
                                onParamChange={(_, param, val) =>
                                    onParamChange?.(name, param, val)
                                }
                                expandOnce={expandOnce}
                                setExpandOnce={setExpandOnce}
                                inputProps={inputProps}
                                pProps={pProps}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}