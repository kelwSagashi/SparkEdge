import React from 'react';
import { Input } from '../ui/input';
import { ChevronRight, Folder } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';
import DraggableValue from '../DraggableValue';
import { ItemTypes } from '@/lib/constants';

export function JsonViewMain({
    className,
    data,
    onParamChange,
    inputProps,
    pProps,
    ...props
}: React.ComponentProps<"div"> & {
    data: Record<string, any>,
    onParamChange?: (endpointName: string, paramName: string, value: string) => void;
    inputProps?: React.ComponentProps<"input">;
    pProps?: React.ComponentProps<"p">;
}) {
    return (
        <div className='flex flex-col'>
            <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden'>
                <div className='relative flex w-full min-w-0 flex-col p-2'>
                    <div className='w-full text-sm'>
                        <div className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props}>
                            {Object.entries(data).map(([name, value]) => (
                                <JsonView key={name} name={name} value={value} onParamChange={onParamChange} inputProps={inputProps} pProps={pProps} />
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
    inputProps,
    pProps,
    onParamChange,
}: {
    name: string;
    value: any;
    onParamChange?: (endpointName: string, paramName: string, value: string) => void;
    inputProps?: React.ComponentProps<"input">;
    pProps?: React.ComponentProps<"p">;
}) {
    const isObject = typeof value === "object" && value !== null;

    if (!isObject) {
        return (
            <JsonButtonView
                className="w-80 data-[active=true]:bg-transparent"
            >
                <div className='w-full flex gap-2 items-center'>
                    <span className='bg-foreground p-2 rounded w-auto'>{name}</span>
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
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen={name === "components" || name === "ui"}
            >
                <CollapsibleTrigger asChild>
                    <JsonButtonView>
                        <ChevronRight className="transition-transform" />
                        <Folder />
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
                                onParamChange={(_, param, val) =>
                                    onParamChange?.(name, param, val)
                                }
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