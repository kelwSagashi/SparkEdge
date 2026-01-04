import {
    IExecuteFunctions, 
    INodeTypeExecutionContext, 
    INodeInputConfiguration, 
    INodeOutputConfiguration, 
    INodeType, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType,
    ScriptSDKSchema,
    IDataObject,
    INodeIOConfigurationTypes
} from 'nmg8-workflow';
import { spawn } from "child_process";
import path from 'node:path';
import { NodeType } from '@/type';

export class Script extends NodeType {
    description: INodeTypeDescription = {
        displayName: "Script",
        name: "Script",
        icon: "file:script.svg",
        type: 'base',
        version: 1,
        defaultVersion: 1,
        description: "Executa o script selecionado.",
        defaults: {
            name: "Script",
            handleActions: true,
        },
        inputs: [
            {
                id: 'trigger',
                type: 'trigger',
                name: 'trigger',
            },
        ],
        outputs: [
            {
                id: 'stdout',
                type: 'stdout',
                name: 'Saída'
            },
            {
                id: 'stderr',
                type: 'stderr',
                name: 'Erro'
            },
        ],
        properties: [
            {
                displayName: 'Selecionar Script',
                placeholder: 'selecione',
                name: 'script',
                type: 'options',
                required: true,
                displayInNode: true,
                description: "",
                routing: {
                    request: {
                        url: '/scripts',
                        method: 'GET',
                    }
                },
                displayOptions: {
                    replace: {
                        id: {as: ['id']},
                        value: {as: ['id']},
                        key: {as: ['id']},
                        name: {as: ['name']},
                        description: {as: ['author', 'language', 'repo'], separator: ' • '}
                    }
                },
                onSelect: [
                    {
                        updateNodeData: {
                            routing: {
                                request: {
                                    url: '/nodes/invoke/Script/getInputs',
                                    method: 'POST'
                                }
                            },
                        },
                    },
                    {
                        updateNodeData: {
                            routing: {
                                request: {
                                    url: '/nodes/invoke/Script/getOutputs',
                                    method: 'POST'
                                }
                            },
                        },
                    },

                ]
            },
        ]
    }

    getScriptPath(context: INodeTypeExecutionContext) {
        const s_path = context.getNodeParameter('script.path', '');
        const s_file_name = context.getNodeParameter('script.main_file_name', '');
        const script_path = path.join(__dirname, '../../../../../', s_path, s_file_name);
        return script_path;
    }

    getSchema(scriptPath: string): Promise<ScriptSDKSchema> {
        return new Promise((resolve, reject) => {
            const py = spawn("python", [scriptPath, "--schema"]);

            let stdout = "";
            let stderr = "";

            py.stdout.on("data", chunk => stdout += chunk.toString());
            py.stderr.on("data", chunk => stderr += chunk.toString());

            py.on("close", code => {
                if (code !== 0) return reject(new Error("Python returned error: " + stderr));
                try {
                    resolve(JSON.parse(stdout));
                } catch (err) {
                    reject(new Error("Invalid JSON schema: " + stdout));
                }
            });
        });
    }

    getProperties(): INodeTypeDescription {
        return this.description;
    }
    
    getInputs(context: INodeTypeExecutionContext) {
        return this.getSchema(this.getScriptPath(context)).then(response => {
            const inputs: Array<INodeInputConfiguration> = response.
                schema.inputs.map(item => ({
                    id: item.name,
                    type: item.type as INodeIOConfigurationTypes,
                    name: item.name,
                    position: 'left',
                    required: item.required
            }));
            return {
                inputs: [...this.description.inputs, ...inputs].filter(
                    (obj, index, self) => index === self.findIndex((t) => t.name === obj.id || t.id === obj.id)
                )
            };
        }).catch(() => ({inputs: this.description.inputs}))
    }
    
    test(context: INodeTypeExecutionContext) {
        return Promise.resolve({test: ['algo']});
    }

    getOutputs(context: INodeTypeExecutionContext) {
        return this.getSchema(this.getScriptPath(context)).then(response => {
            const outputs: Array<INodeOutputConfiguration> = response.
                schema.outputs.map(item => ({
                    id: item.name,
                    type: item.type as INodeIOConfigurationTypes,
                    name: item.name,
            }));
            return {
                outputs: [...this.description.outputs, ...outputs].filter(
                    (obj, index, self) =>
                    index === self.findIndex((t) => t.name === obj.id || t.id === obj.id)
                )
            };
        }).catch(() => ({outputs: this.description.outputs}));
    }

    execute(context: IExecuteFunctions): Promise<NodeOutput> {
        const scriptPath = this.getScriptPath(context.nodeContext);
        const payload = context.getInputData()
        console.log('script input data', JSON.stringify(payload))

        return new Promise((resolve, reject) => {
            const py = spawn("python", [scriptPath]);

            let stdout = "";
            let stderr = "";

            py.stdout.on("data", chunk => stdout += chunk.toString());
            py.stderr.on("data", chunk => stderr += chunk.toString());

            py.on("close", code => {
                if (code !== 0) return reject(new Error("Python returned error: " + stderr));
                try {
                    resolve({
                        data: JSON.parse(stdout) as IDataObject    
                    });
                } catch (err) {
                    reject(new Error("Invalid JSON schema: " + stdout));
                }
            });

            py.stdin.write(JSON.stringify({ip: 'a', device_id: 'aa', host: 'google.com', protocol: 'https'}));
            py.stdin.end();

            const timer = setTimeout(() => {
                py.kill("SIGKILL");
                reject(new Error("Timeout running python script"));
            }, 10000);
        });
    }
}