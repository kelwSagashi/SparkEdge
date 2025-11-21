import { NodeType } from '@/type';
import {
    IExecuteFunctions, 
    INodeTypeExecutionContext, 
    INodeInputConfiguration,
    INodeOutputConfiguration, 
    INodeType, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType
} from 'nmg8-workflow';

export class Device extends NodeType {
    description: INodeTypeDescription = {
        displayName: "Device",
        name: "Device",
        icon: "file:device.svg",
        type: 'base',
        version: 1,
        defaultVersion: 1,
        description: "Executa o dispositivo selecionado.",
        defaults: {
            name: "Device",
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
                id: 'data',
                name: 'data',
                type: 'output.json'
            }
        ],
        properties: [
            {
                type: 'options',
                displayName: 'mode',
                name: 'mode',
                options: [
                    {
						name: 'Manual',
						value: 'manual',
                        description: '',
					},
					{
						name: 'Server',
						value: 'server',
                        description: '',
					},
                ],
                displayOptions: {
                    replace: {
                        description: {as: ['description']},
                        id: {as:['value']},
                        key: {as: ['value']},
                        name: {as: ['name']},
                        value: {as: ['value']}
                    }
                }
            }
        ]
    }

    getProperties(): INodeTypeDescription {
        return this.description;
    }

    getInputs(data: NodeParameterValueType) {
        return Promise.resolve({inputs: this.description.inputs});
    }
    
    test(data: NodeParameterValueType): Promise<any>{
        return Promise.resolve({test: []});
    }

    getOutputs(data: NodeParameterValueType) {
        return Promise.resolve({outputs: this.description.outputs});
    }

    execute(context: IExecuteFunctions): Promise<NodeOutput> {
        return Promise.resolve({
            data: {}
        })
    }
}