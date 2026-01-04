import { NodeType } from '@/type';
import {
    IExecuteFunctions, 
    INodeTypeExecutionContext, 
    INodeInputConfiguration,
    INodeOutputConfiguration, 
    INodeType, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType,
    IDataObject
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
                id: 'device',
                name: 'device',
                type: 'json'
            }
        ],
        properties: [
            {
                type: 'options',
                displayName: 'device',
                name: 'device',
                routing: {
                    request: {
                        url: "/devices",
                        method: "GET"
                    }
                },
                displayInNode: true,
                displayOptions: {
                    replace: {
                        description: {as: ['description']},
                        id: {as:['id']},
                        key: {as: ['id']},
                        name: {as: ['name']},
                        value: {as: ['id']}
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
        const device = context.nodeContext.getNodeParameter<IDataObject>('device', {});
        return Promise.resolve({
            data: device
        })
    }
}