/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Paths, Servers } from '@/mock/severs';
import { Button } from './ui/button';
import React, { useCallback, useEffect, useState } from 'react';
import { extractEndpointKeys, parseEndpoint } from '@/server/executor/server-executor';
import { Input } from './ui/input';
import z from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { DeviceConnectionMethods } from 'nmg8-db/src/schema/index.ts';
import type { ServerEndpointsReturningValues, ServerReturningValues } from 'nmg8-db/src/types/index.ts';
import { JsonViewMain } from './json-view/json-view';
import { api } from '@/server/server.service';

export type ServiceType = 'rest' | 'google_drive' | null;

type Props = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

function GetService({
    setServerSelected
}: {
    setServerSelected: React.Dispatch<React.SetStateAction<ServerReturningValues | undefined>>
}) {
    const [selection, setSelection] = useState<ServerReturningValues>();
    useEffect(() => {
        setServerSelected(selection);
    }, [setServerSelected, selection]);

    return (
        <div className='w-full'>
            <span className="font-medium text-muted-foreground">Escolha o serviço</span>
            <Select onValueChange={(val) => {
                const selectedServer = Servers.find(s => s.id === val);
                if (selectedServer) setSelection(selectedServer);
            }}>
                <SelectTrigger className="w-full p-6">
                    <SelectValue placeholder="Selecionar um servidor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Servidores</SelectLabel>
                        {Servers.map(item => (
                            <SelectItem key={item.id} id={item.id} value={item.id} className='w-full justify-start p-6'>
                                <div className="text-left">
                                    <p className="font-semibold text-primary">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.base_url}</p>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}

const endpointSchema = z.object({
    endpoints: z.array(z.object({
        id: z.string(),
        uniqueKey: z.string(),
        params: z.record(z.string(), z.string().min(1, { error: "Campo obrigatório!" })).optional()
    }))
});

type EndpointsFormValues = z.infer<typeof endpointSchema>;



function GetPath({ serverSelected }: { serverSelected: ServerReturningValues | undefined }) {
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
            const response = await api.execute({
                server: serverSelected, 
                endpoint: path, 
                params, 
                body: null
                });
            handleResponseChange(endpointUniqueKey, response.data)
            setCurrentRTab("outputs");
        }
    }, []
    );

    const handleSaveDevice = (deviceData: DeviceFormValues) => {
        console.log("Dispositivo Salvo:", deviceData);
    };

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
                                                                <SelectValue className='truncate break-words' placeholder="Selecionar um endpoint" />
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
                                    <DeviceConfigForm onSaveDevice={handleSaveDevice} />
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

export default function AddDeviceDialog({ isOpen, onOpenChange }: Props) {
    const [serverSelected, setServerSelected] = useState<ServerReturningValues>();
    const [currentStep, setCurrentStep] = useState(0);
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='px-2 sm:h-auto h-auto max-w-[98%] sm:max-w-[98%] max-h-[80%] sm:max-h-[80%] flex flex-col overflow-hidden' onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className='p-2'>
                    <DialogTitle className='px-4 text-primary'>Adicionar Dispositivo para Monitoramento</DialogTitle>
                </DialogHeader>
                <Separator />
                <div className="flex min-h-0 py-2">
                    {currentStep === 0 && <GetService setServerSelected={setServerSelected} />}
                    {currentStep === 1 && <GetPath serverSelected={serverSelected} />}
                </div>
                <DialogFooter className='p-2'>
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setCurrentStep(cur => cur - 1)}
                        >
                            Voltar
                        </Button>
                    )}
                    {currentStep < 1 && (<Button
                        onClick={() => setCurrentStep(cur => cur + 1)}
                    >
                        Continuar
                    </Button>)
                    }
                    {currentStep > 0 && (<Button type="submit" form='device_form' className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Salvar Dispositivo
                    </Button>)}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// Em GetPath (ou em um novo arquivo, se a complexidade aumentar), adicione este componente.
// Vamos adicioná-lo dentro de GetPath por enquanto para acesso direto a endpointResponseMap.
const deviceFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nome é obrigatório"),
    brand: z.string().min(1, "Marca é obrigatória"),
    connection: z.enum(DeviceConnectionMethods),
    others: z.array(z.object({
        key: z.string().min(1, "Chave é obrigatória"),
        value: z.string().min(1, "Valor é obrigatório"),
        type: z.enum(["text", "number"])
    }))
});

type DeviceFormValues = z.infer<typeof deviceFormSchema>;
type DeviceConnectionFormValues = keyof typeof deviceFormSchema.shape.connection.enum;

interface DeviceConfigFormProps {
    onSaveDevice: (deviceData: DeviceFormValues) => void;
}

type DroppableInputProps = React.ComponentProps<"input"> & {
    accept: string;
    onDrop?: (item: any) => void;
}

const DroppableInput: React.FC<DroppableInputProps> = React.memo(function DInput({
    accept, onDrop, className, ...props
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept,
        drop: onDrop,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isActive = isOver && canDrop;
    let backgroundColor = ''
    if (isActive) {
        backgroundColor = 'bg-foreground text-primary'
    } else if (canDrop) {
        backgroundColor = ''
    }
    const borderColor = isActive ? 'ring-1' : (canDrop ? 'border-dashed border-muted' : '');

    return (
        <div
            ref={drop as any}
        >
            <Input
                className={cn(
                    className,
                    borderColor,
                    backgroundColor,
                    "border-border/60 placeholder:text-foreground rounded text-primary transition-all duration-150"
                )}
                {...props}
            />
        </div>
    );
});

const DroppableDiv: React.FC<(
    React.ComponentProps<"div"> & {
        accept: string,
        over?: () => void
    })> = React.memo(function DDiv({
        accept, onDrop, over, ...props
    }) {
        const [{ isOver }, drop] = useDrop({
            accept,
            drop: onDrop,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        });

        useEffect(() => {
            if (isOver) over?.();
        }, [over, isOver])

        return (
            <div
                ref={drop as any}
                {...props}
            />
        );
    });

function DeviceConfigForm({
    onSaveDevice
}: DeviceConfigFormProps) {
    const form = useForm<DeviceFormValues>({
        resolver: zodResolver(deviceFormSchema),
        defaultValues: {
            id: "",
            name: "",
            brand: "",
            others: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "others"
    });

    const onSubmit = (data: DeviceFormValues) => {
        console.log("Device Data:", data);
        onSaveDevice(data); // Chama a função passada via props para salvar o dispositivo
    };


    // Função para lidar com a soltura (drop)
    const handleDrop = (value: string, fieldName: keyof DeviceFormValues | `others.${number}.value`) => {
        form.setValue(fieldName, value, { shouldValidate: true });
    };

    return (
        <form id="device_form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Campos Padrão */}
            <div>
                <label className="text-muted-foreground text-sm" htmlFor="device-id">ID</label>
                <DroppableInput
                    id="device-id"
                    placeholder="ID único do dispositivo"
                    {...form.register("id")}
                    className={form.formState.errors.id ? "border-destructive" : ""}
                    accept={ItemTypes.OUTPUT_VALUE}
                    onDrop={(item) => handleDrop(item.value, 'id')}
                />
                {form.formState.errors.id && <p className="text-destructive text-sm mt-1">{form.formState.errors.id.message}</p>}
            </div>
            <div>
                <label className="text-muted-foreground text-sm" htmlFor="device-name">Nome</label>
                <DroppableInput
                    id="device-name"
                    placeholder="Nome do dispositivo (ex: Inversor 1)"
                    {...form.register("name")}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                    accept={ItemTypes.OUTPUT_VALUE}
                    onDrop={(item) => handleDrop(item.value, 'name')}
                />
                {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
                <label className="text-muted-foreground text-sm" htmlFor="device-brand">Marca</label>
                <DroppableInput
                    id="device-brand"
                    placeholder="Marca do dispositivo (ex: Intelbras)"
                    {...form.register("brand")}
                    className={form.formState.errors.brand ? "border-destructive" : ""}
                    accept={ItemTypes.OUTPUT_VALUE}
                    onDrop={(item) => handleDrop(item.value, 'brand')}
                />
                {form.formState.errors.brand && <p className="text-destructive text-sm mt-1">{form.formState.errors.brand.message}</p>}
            </div>
            <div>
                <label className="text-muted-foreground text-sm" htmlFor={`connection`}>Tipo</label>
                <Select onValueChange={(val: DeviceConnectionFormValues) => form.setValue(`connection`, val)} defaultValue={form.watch(`connection`)}>
                    <SelectTrigger className="w-30 text-primary">
                        <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent className='text-primary'>
                        {Object.values(deviceFormSchema.shape.connection.enum).map((val, _) => (
                            <SelectItem value={val}>{val}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.connection && <p className="text-destructive text-sm mt-1">{form.formState.errors.connection?.message}</p>}
            </div>

            <Separator className="my-6" />

            {/* Campos Adicionais "Others" */}
            <h4 className="text-foreground text-lg font-medium">Outros Campos (Personalizados)</h4>
            {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 p-3 border border-border rounded-md relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className='flex flex-row gap-2 w-full justify-between'>
                            <div className='w-full'>
                                <div className='h-9'>
                                    <Tooltip open={(!!form.formState.errors.others?.[index]?.key)}>
                                        <TooltipTrigger asChild>
                                            <Input
                                                id={`others-${index}-key`}
                                                placeholder="Nome do campo (ex: serial_number)"
                                                {...form.register(`others.${index}.key`)}
                                                className={cn(
                                                    form.formState.errors.others?.[index]?.key ? "border-destructive" : "",
                                                    "text-primary border-none focus-visible:ring-0 px-0"
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {form.formState.errors.others?.[index]?.key && <p className="text-destructive text-sm mt-1">{form.formState.errors.others[index]?.key?.message}</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <DroppableInput
                                    id={`others-${index}-value`}
                                    placeholder="Valor do campo"
                                    {...form.register(`others.${index}.value`)}
                                    className={cn(
                                        form.formState.errors.others?.[index]?.value ? "border-destructive" : "",
                                        ""
                                    )}
                                    accept={ItemTypes.OUTPUT_VALUE}
                                    onDrop={(item) => handleDrop(item.value, `others.${index}.value`)}
                                />
                                {form.formState.errors.others?.[index]?.value && <p className="text-destructive text-sm mt-1">{form.formState.errors.others[index]?.value?.message}</p>}
                            </div>
                            <div>
                                <div className='h-9 py-1'>
                                    <label className="text-muted-foreground text-sm" htmlFor={`others-${index}-type`}>Tipo</label>
                                </div>
                                <Select onValueChange={(val: "text" | "number") => form.setValue(`others.${index}.type`, val)} defaultValue={form.watch(`others.${index}.type`)}>
                                    <SelectTrigger className="w-30 text-primary">
                                        <SelectValue placeholder="Selecionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent className='text-primary'>
                                        <SelectItem value="text">Texto</SelectItem>
                                        <SelectItem value="number">Numérico</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.others?.[index]?.type && <p className="text-destructive text-sm mt-1">{form.formState.errors.others[index]?.type?.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ key: "", value: "", type: "text" })}>
                Adicionar Campo Personalizado
            </Button>
        </form>
    );
}