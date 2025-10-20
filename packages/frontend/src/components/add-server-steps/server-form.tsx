import { useForm, useFieldArray, type UseFormReturn, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { AuthorizationTypes, ServerEndpointMethods } from '@nmg8/db/src/db/schema';
import { useCallback, useMemo, useState } from 'react';
import { ApiKeyAuthForm } from '../auth-forms/APIKeyForm';
import { BasicAuthForm } from '../auth-forms/BasicAuth';
import { BearerTokenAuthForm } from '../auth-forms/BearerTokenForm';
import { DigestAuthForm } from '../auth-forms/DigestAuthForm';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group';
import { cn } from '@/lib/utils';
import { CodeXml } from 'lucide-react';

const digestAuthSchema = z.object({
  auth_username: z.string().min(1, "Nome de usuário é obrigatório"),
  auth_password: z.string().min(1, "Senha é obrigatória"),
  auth_realm: z.string().optional(),
});

export const DigestAuthSchema = digestAuthSchema;
export type DigestAuthFormValues = z.infer<typeof digestAuthSchema>;

const basicAuthSchema = z.object({
  auth_username: z.string().min(1, "Nome de usuário é obrigatório"),
  auth_password: z.string().min(1, "Senha é obrigatória"),
});
export const BasicAuthSchema = basicAuthSchema;
export type BasicAuthFormValues = z.infer<typeof basicAuthSchema>;

const bearerTokenSchema = z.object({
  auth_token: z.string().min(1, "Bearer Token é obrigatório"),
});

export const BearerTokenSchema = bearerTokenSchema;
export type BearerTokenFormValues = z.infer<typeof bearerTokenSchema>;

// Schema Zod para validação do formulário
const apiKeySchema = z.object({
  auth_token: z.string().min(1, "API Key é obrigatória"),
  auth_api_key_location: z.enum(["header", "query"]),
  auth_header_name: z.string().min(1, "Nome do cabeçalho é obrigatório").optional(),
  auth_query_param_name: z.string().min(1, "Nome do parâmetro de query é obrigatório").optional(),
}).superRefine((data, ctx) => {
  // Lógica condicional de validação:
  if (data.auth_api_key_location === "header" && !data.auth_header_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nome do cabeçalho é obrigatório quando a API Key é enviada no cabeçalho.",
      path: ['auth_header_name'],
    });
  }
  if (data.auth_api_key_location === "query" && !data.auth_query_param_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nome do parâmetro de query é obrigatório quando a API Key é enviada na URL.",
      path: ['auth_query_param_name'],
    });
  }
});

export const ApiKeySchema = apiKeySchema;
export type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const ServerEndpointSchema = z.object({
  path: z.string().min(1, "O caminho é obrigatório")
    .regex(/^\//, "O caminho deve começar com '/'")
    .refine((val) => {
      // Verifica se as chaves estão balanceadas
      const open = (val.match(/{{/g) || []).length;
      const close = (val.match(/}}/g) || []).length;
      return open === close;
    }, { message: "As variáveis '{{ }}' estão desbalanceadas" })
    .refine((val) => !val.match(/{[^{}]+{/) && !val.match(/}[^{}]+}/), { message: "Formato inválido de variável no caminho" })
    .refine((val) => {
      // Não permite ocorrências de {{}} vazias, e valida conteúdo interno de cada placeholder
      const re = /\{\{([\s\S]*?)\}\}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(val)) !== null) {
        const inner = m[1].trim();
        // proíbe vazio
        if (inner.length === 0) return false;
        // valida caracteres permitidos no nome da variável (ajuste o regex se quiser outros caracteres)
        if (!/^[a-zA-Z0-9._-]+$/.test(inner)) return false;
      }
      return true;
    }, { message: "Placeholders devem conter um nome válido (ex: {{id}}) — não pode ser '{{}}'." })
    .regex(/^\/([a-zA-Z0-9_\-\/{}.]*)$/, "O caminho contém caracteres inválidos"),
  method: z.enum(ServerEndpointMethods),
  name: z.string().min(1, "O nome é obrigatória"),
  description: z.string().optional(),
  payload_schema: z.object().optional(),
  response_schema: z.object().optional(),
  headers: z.object().optional()
});

const ServerFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  type: z.string(),
  base_url: z.url("Endereço de URL inválido")
    .refine((val) => !val.endsWith("/"), {
      message: "A URL não deve terminar com '/'",
    }),
  header: z.object().optional(),
});

const FullServerSchema = z.object({
  server: ServerFormSchema,
  authorization: z.object({
    auth_type: z.enum(AuthorizationTypes),
    authorization: z.union([
      ApiKeySchema,
      BasicAuthSchema,
      BearerTokenSchema,
      DigestAuthSchema,
      z.object()
    ]).optional()
  }).optional(),
  endpoints: z.array(ServerEndpointSchema),
});

export type FullServerValues = z.infer<typeof FullServerSchema>;

type Props = {
  previous: () => void;
  next: () => void;
  onClose: () => void;
  step: number;
  serverTypeId: string;
};

export default function ServerStepForm({ serverTypeId }: Pick<Props, "serverTypeId">) {
  const form = useForm<FullServerValues>({
    resolver: zodResolver(FullServerSchema),
    defaultValues: {
      server: { name: '', type: serverTypeId, base_url: '' },
      authorization: { auth_type: 'No Auth', authorization: {} },
      endpoints: [],
    },
    mode: "onBlur",
  });

  const onSubmit = (data: FullServerValues) => {
    console.log("📡 Dados finais:", data);
  };

  return (
    <form id="server_form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full w-full">
      <div className="min-w-full">
        <div className="flex min-h-0 h-full">
          <Tabs className='flex flex-col w-full h-full overflow-hidden' defaultValue="server">
            <TabsList>
              <TabsTrigger value="server">Configurar Servidor</TabsTrigger>
              <TabsTrigger value="auth">
                Autorização
              </TabsTrigger>
              <TabsTrigger value="endpoints">
                Configurar Endpoints
              </TabsTrigger>
            </TabsList>
            <TabsContent value="server" className='flex-1 overflow-hidden min-h-0'>
              <ScrollArea className='h-full w-full'>
                <ServerFirstForm form={form} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="auth" className='flex-1 overflow-hidden min-h-0'>
              <AuthorizationSettings form={form} />
            </TabsContent>
            <TabsContent value="endpoints" className='flex-1 overflow-hidden min-h-0'>
              <ScrollArea className='h-full w-full'>
                <ServerEndpointForm form={form} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </form>
  )
}

function AuthorizationSettings({ form }: { form: UseFormReturn<FullServerValues> }) {
  const { setValue, watch } = form;
  const selected = watch("authorization.auth_type");

  return (
    <ScrollArea className='h-full w-full'>
      <div className='flex gap-2'>
        <div className='space-y-2 w-[140px]'>
          <Label className='text-primary' htmlFor="auth_type">Tipo de Autenticação</Label>
          <Select
            value={selected}
            onValueChange={(val) => {
              setValue("authorization.auth_type", val as typeof AuthorizationTypes[number])
              setValue('authorization.authorization', {});
            }}
          >
            <SelectTrigger className="text-primary">
              <SelectValue placeholder="Selecionar tipo de autenticação" />
            </SelectTrigger>
            <SelectContent className='text-primary'>
              <SelectGroup>
                {AuthorizationTypes.map((item) => (<SelectItem value={item}>{item}</SelectItem>))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className='text-xs'>O cabeçalho de autorização será gerado automaticamente quando você enviar a solicitação.</p>
        </div>
        <div className='w-full space-y-2'>
          {selected === "API Key" && (
            <ApiKeyAuthForm form={form} />
          )}
          {selected === "Basic Auth" && (
            <BasicAuthForm form={form} />
          )}
          {selected === "Bearer Token" && (
            <BearerTokenAuthForm form={form} />
          )}
          {selected === "Digest Auth" && (
            <DigestAuthForm form={form} />
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

function ServerFirstForm({ form }: { form: UseFormReturn<FullServerValues> }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="gap-6 pt-4">
      <div className="col-span-3 space-y-4">
        <div className="space-y-4">
          <h3 className="text-muted-foreground text-lg font-medium">Configurar Conexão REST</h3>
          <div>
            <Input className='text-primary rounded' {...register('server.name')} placeholder="Nome do Serviço" />
            {errors.server?.name && <p className="text-sm text-red-500 mt-1">{errors.server?.name.message}</p>}
          </div>
          <div>
            <Input className='text-primary rounded' {...register('server.base_url')} placeholder="URL do Servidor (ex: http://api.exemplo.com)" />
            {errors.server?.base_url && <p className="text-sm text-red-500 mt-1">{errors.server?.base_url.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const Methods = [
  { value: ServerEndpointMethods[0], className: 'text-[#04D397] focus:text-[#04D397]' },
  { value: ServerEndpointMethods[1], className: 'text-[#EBD176] focus:text-[#EBD176]' },
  { value: ServerEndpointMethods[2], className: 'text-[#52A1DF] focus:text-[#52A1DF]' },
  { value: ServerEndpointMethods[3], className: 'text-[#C0A3DB] focus:text-[#C0A3DB]' },
  { value: ServerEndpointMethods[4], className: 'text-[#F79185] focus:text-[#F79185]' },
]

function EndpointSelect({
  onChange
}: {
  onChange: (value: string) => void
}) {
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const methodStyle = useMemo(() => Methods.find((m) => m.value === selectedMethod)?.className, [selectedMethod]);
  return (

    <Select value={selectedMethod} onValueChange={(value) => {
      setSelectedMethod(value);
      onChange(value);
    }}>
      <SelectTrigger className={cn("text-primary border-none", methodStyle)}>
        <SelectValue placeholder="Método" />
      </SelectTrigger>
      <SelectContent className='text-primary'>
        {Methods.map(item => (
          <SelectItem value={item.value} className={cn(item.className, 'font-medium')}>{item.value}</SelectItem>
        ))}
      </SelectContent>
    </Select>

  )
}

function EndpointInsertVariable({
  onClick,
  index,
}: { onClick: (value: string) => void, index: number }) {

  function isSelectionInsidePlaceholder(value: string, selectionStart: number, selectionEnd: number) {
    const lastOpen = value.lastIndexOf("{{", Math.max(0, selectionEnd - 1));
    if (lastOpen === -1) return false;
    const closeAfterOpen = value.indexOf("}}", lastOpen + 2);
    if (closeAfterOpen === -1) return false;
    return closeAfterOpen >= selectionStart;
  }

  const handleInsertVariable = useCallback(() => {
    const input = document.getElementById(`endpoint-input-${index}`) as HTMLInputElement;
    if (!input) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const value = input.value;

    if (isSelectionInsidePlaceholder(value, start, end)) {
      return;
    }

    const before = value.slice(0, start);
    const after = value.slice(end);
    const newValue = `${before}{{}}${after}`;
    onClick(newValue);

    setTimeout(() => {
      input.focus();
      const newCursorPos = start + 2;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [onClick, index]);

  return (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        type="button"
        variant="ghost"
        onClick={handleInsertVariable}
        title="Inserir variável"
      >
        <CodeXml />
      </InputGroupButton>
    </InputGroupAddon>
  )
}

function ServerEndpointForm({ form }: { form: UseFormReturn<FullServerValues> }) {
  const { control, setValue, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "endpoints",
  });

  return (
    <div className="gap-6 pt-4">
      <div className="col-span-3 space-y-4">
        <div className="space-y-4">
          <h3 className="text-muted-foreground text-lg font-medium">Configurar Endpoints</h3>
          {fields.map((field, index) => (
            <div>
              <Controller
                control={form.control}
                name={`endpoints.${index}.name`}
                render={({ field, fieldState }) => (
                  <div className='space-y-2'>
                    <Label className='text-primary'>Nome</Label>
                    <Input
                      placeholder="Nome"
                      {...field}
                      className={cn(fieldState.error && "border-destructive", "text-primary rounded")}
                    />
                    {fieldState.error && <p className="text-destructive text-sm mt-1">{fieldState.error.message}</p>}
                  </div>
                )} />
              <div>

                <div key={field.id} className="flex items-center gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <EndpointSelect onChange={(value) => {
                        register(`endpoints.${index}.method`).onChange({ target: { value } })
                      }} />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={`endpoint-input-${index}`}
                      {...register(`endpoints.${index}.path`)}
                      placeholder="/"
                      className="text-primary flex-grow"
                    />
                    <EndpointInsertVariable index={index} onClick={(value) => {
                      setValue(`endpoints.${index}.path`, value)
                    }} />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton type="button" variant="ghost" onClick={() => remove(index)}>&times;</InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                {form.formState.errors.endpoints?.[index]?.path && <p className="text-sm text-red-500 mt-1">{form.formState.errors.endpoints?.[index]?.path?.message}</p>}
              </div>

            </div>
          ))}
          <Button className='' type="button" variant="default" onClick={() => append({ path: '', method: "GET", name: '', description: '' })}>
            Adicionar Endpoint
          </Button>
        </div>
      </div>
    </div>
  );
}
