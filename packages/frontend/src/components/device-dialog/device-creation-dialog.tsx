import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Paths } from '@/mock/severs';
import { Button } from '../ui/button';
import React, { useCallback, useState } from 'react';
import { extractEndpointKeys, parseEndpoint } from '@/server/executor/server-executor';
import z from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ItemTypes } from '@/lib/constants';
import { JsonViewMain } from '../json-view/json-view';
import { api } from '@/server/server.service';
import type { DeviceUpsertValues, ServerEndpointsReturningValues, ServerReturningValues } from 'nmg8-db/src/types';
import { endpointSchema, type DeviceFormValues, type EndpointsFormValues } from './types';
import DeviceConfigForm from './device-config-form';
import DroppableDiv from './droppable-div';


export default function DeviceCreationDialog({ 
    serverSelected,
    setSaving,
    onOpenChange
}: { 
    serverSelected: ServerReturningValues | undefined;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenChange: (isOpen: boolean) => void  
}) {
    const [selectedParams, setSelectedParams] = useState<Record<number, string[]>>({});
    const [selectedParamsMap, setSelectedParamsMap] = useState<Record<string, any>>({});
    const [endpointResponseMap, setEndpointResponseMap] = useState<Record<string, any>>({});
    const [currentRTab, setCurrentRTab] = useState('inputs');
    const [currentLTab, setCurrentLTab] = useState('config');

    const form = useForm<EndpointsFormValues>({
        resolver: zodResolver(endpointSchema),
        defaultValues: {
            endpoints: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "endpoints"
    });

    const handleSelectChange = (index: number, id: string) => {
        const newPath = Paths.find((item) => item.id === id);
        if (!newPath) return;

        const oldId = form.getValues(`endpoints.${index}.id`);
        const oldUniqueKey = form.getValues(`endpoints.${index}.uniqueKey`);

        if (oldId === id && oldUniqueKey) {
            return;
        }

        const params = extractEndpointKeys(newPath.path);
        const emptyParams = Object.fromEntries(params.map((p) => [p, ""]));

        setSelectedParams((prev) => ({
            ...prev,
            [index]: params,
        }));

        const uniqueName = `${newPath.name}#${index}`;

        setSelectedParamsMap((prev) => {
            const updated = { ...prev };

            if (oldUniqueKey && updated[oldUniqueKey]) {
                delete updated[oldUniqueKey];
            }

            updated[uniqueName] = emptyParams;
            return updated;
        });

        setEndpointResponseMap((prev) => {
            const updated = { ...prev };

            if (oldUniqueKey && updated[oldUniqueKey]) {
                delete updated[oldUniqueKey];
            }

            return updated;
        });

        form.setValue(`endpoints.${index}.id`, id);
        form.setValue(`endpoints.${index}.uniqueKey`, uniqueName);
        form.setValue(`endpoints.${index}.params`, emptyParams);
        setCurrentRTab("inputs");
    }

    const handleRemove = (index: number) => {
        const uniqueKey = form.getValues(`endpoints.${index}.uniqueKey`);
        remove(index);

        setSelectedParams((prev) => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });

        if (uniqueKey) {
            setSelectedParamsMap((prev) => {
                const updated = { ...prev };
                delete updated[uniqueKey];
                return updated;
            });

            setEndpointResponseMap((prev) => {
                const updated = { ...prev };
                delete updated[uniqueKey];
                return updated;
            });
        }
    }

    const handleParamChange = (endpointUniqueKey: string, paramName: string, value: string) => {
        const formValues = form.getValues('endpoints');
        const index = formValues.findIndex((item) => item.uniqueKey === endpointUniqueKey);
        form.setValue(`endpoints.${index}.params.${paramName}`, value)
        setSelectedParamsMap((prev) => ({
            ...prev,
            [endpointUniqueKey]: {
                ...prev[endpointUniqueKey],
                [paramName]: value,
            },
        }));
    };

    const handleResponseChange = (endpointUniqueKey: string, value: any) => {
        setEndpointResponseMap((prev) => ({
            ...prev,
            [endpointUniqueKey]: value
        }));
    };

    const isEndpointValid = (endpointName: string) => {
        const params = selectedParamsMap[endpointName];
        if (!params) return false;
        return Object.values(params).every((v) => v !== "");
    };

    const onSubmit = (data: EndpointsFormValues) => {
        console.log("REST Server Data:", data);
    };

    const handleExecute = useCallback(
        async (
        path: ServerEndpointsReturningValues | undefined, 
        endpointUniqueKey: string, 
        params?: Record<string, string>
        ) => {
        if (path && serverSelected) {
            // const response = await api.execute({
            //     server: serverSelected, 
            //     endpoint: path, 
            //     params, 
            //     body: null
            //     });
            // handleResponseChange(endpointUniqueKey, response.data)
            setCurrentRTab("outputs");
        }
    }, []
    );

    const handleSaveDevice = useCallback(async (deviceData: DeviceFormValues) => {
        setSaving(true);
        try {
            const payload: DeviceUpsertValues = {
                device_id: deviceData.id,
                name: deviceData.name,
                brand: deviceData.brand,
                serial_number: deviceData.serial_number,
                connection_method: deviceData.connection,
                others: deviceData.others,
                description: deviceData.description,
                ip_address: deviceData.ip_address,
                location: deviceData.location,
            };

            const res = await api.createDevice(payload);
            const data = res.data?.data
            if (data) {
                // success: close dialog
                onOpenChange(false);
                // simple feedback
                alert('Device created');
            } else {
                alert(res.data.error ?? 'Failed to create device');
            }
        } catch (err: any) {
            alert('Error: ' + (err?.message ?? String(err)));
        } finally {
            setSaving(false);
        }
    }, [setSaving, onOpenChange]);

    return (
        <div className="w-full min-w-full">
            <div className="flex min-h-0 h-full">
                <div className='min-w-[50%] pl-2'>
                    <Tabs value={currentLTab} onValueChange={(val) => setCurrentLTab(val)} className='flex flex-col h-full overflow-hidden' defaultValue="config">
                        <TabsList>
                            <TabsTrigger value="config">Endpoints</TabsTrigger>
                            <TabsTrigger value="create">
                                <DroppableDiv accept={ItemTypes.OUTPUT_VALUE} over={() => setCurrentLTab('create')}>
                                    Criar Dispositivo
                                </DroppableDiv>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="config" className='flex-1 overflow-hidden min-h-0'>
                            <ScrollArea className='h-full w-full'>
                                <div className='space-y-4'>
                                    <h3 className="text-muted-foreground text-lg font-medium">Configurar Endpoints</h3>
                                    {fields.map((field, index) => {
                                        const id = form.watch(`endpoints.${index}.id`);
                                        const params = form.watch(`endpoints.${index}.params`);
                                        const uniqueKey = form.watch(`endpoints.${index}.uniqueKey`);
                                        const path = Paths.find((p) => p.id === id);

                                        return (
                                            <form onSubmit={form.handleSubmit(onSubmit)} key={field.id}>
                                                <div className='w-full flex flex-col'>
                                                    <div key={index} className="flex items-center gap-2 w-full">
                                                        <Select
                                                            key={`paths.${index}`}
                                                            {...form.register(`endpoints.${index}.id`)}
                                                            onValueChange={(val) => handleSelectChange(index, val)}
                                                        >
                                                            <SelectTrigger className="w-[280px] py-8 ">
                                                                <SelectValue className='truncate wrap-break-words' placeholder="Selecionar um endpoint" />
                                                            </SelectTrigger>
                                                            <SelectContent className='w-[280px] wrap-break-word truncate'>
                                                                <SelectGroup>
                                                                    <SelectLabel>Endpoints</SelectLabel>
                                                                    {Paths.filter((item) => item.server_id === serverSelected?.id).map(
                                                                        (item) => (
                                                                            <SelectItem
                                                                                key={item.id}
                                                                                value={item.id}
                                                                                className="w-full justify-start p-4"
                                                                            >
                                                                                <div className="text-left flex flex-col">
                                                                                    <p className="font-semibold text-primary">{item.name}</p>
                                                                                    <span className="py-1">
                                                                                        {parseEndpoint(item.path).map((part, i) => {
                                                                                            if (part.type === "param") {
                                                                                                return (
                                                                                                    <span
                                                                                                        key={i}
                                                                                                        className="align-middle text-sm bg-emerald-500 rounded-sm text-primary p-1"
                                                                                                    >
                                                                                                        {selectedParamsMap[uniqueKey]?.[part.name] || part.value}
                                                                                                    </span>
                                                                                                );
                                                                                            }
                                                                                            return (
                                                                                                <span
                                                                                                    key={i}
                                                                                                    className="text-sm text-muted-foreground"
                                                                                                >
                                                                                                    {part.value}
                                                                                                </span>
                                                                                            );
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            disabled={!isEndpointValid(uniqueKey)}
                                                            variant="default"
                                                            className='bg-accent-foreground hover:bg-accent-foreground/70 hover:text-primary'
                                                            onClick={() => handleExecute(path, uniqueKey, params)}
                                                        >
                                                            Executar
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index)}>
                                                            <Trash />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        )
                                    })}

                                    <Button className='' type="button" variant="default" onClick={() => append({ id: "", uniqueKey: "", params: {} })}>
                                        Adicionar Endpoint
                                    </Button>
                                </div>
                            </ScrollArea>

                        </TabsContent>
                        <TabsContent value="create" className='flex-1 overflow-hidden min-h-0'>
                            <ScrollArea className='h-full w-full'>
                                <div className='p-2'>
                                    <DeviceConfigForm onSubmit={handleSaveDevice} />
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
                <Separator orientation='vertical' />
                <div className='min-w-[50%] pl-2'>
                    <Tabs value={currentRTab} onValueChange={(val) => setCurrentRTab(val)} defaultValue="inputs" className='flex flex-col h-full overflow-hidden'>
                        <TabsList>
                            <TabsTrigger value="inputs">Inputs</TabsTrigger>
                            <TabsTrigger value="outputs">Outputs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="inputs" className='flex-1 overflow-hidden min-h-0'>
                            <ScrollArea className='h-full w-full'>
                                <h3 className="text-muted-foreground text-lg font-medium">Inputs</h3>
                                <JsonViewMain
                                    inputProps={{
                                        className: "w-auto border-border rounded"
                                    }}
                                    data={selectedParamsMap}
                                    onParamChange={handleParamChange}
                                />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="outputs" className='flex-1 overflow-hidden min-h-0'>
                            <ScrollArea className='h-full w-full'>
                                <h3 className="text-muted-foreground text-lg font-medium">Outputs</h3>
                                <JsonViewMain
                                    pProps={{
                                        className: cn(
                                            "border-none break-all w-full text-sm py-1 px-2 rounded hover:bg-accent cursor-grab"
                                        )
                                    }}
                                    data={endpointResponseMap}
                                />
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}