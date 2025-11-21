import { NodeType } from '@/type';
import {
    IExecuteFunctions, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType
} from 'nmg8-workflow';

export class String extends NodeType {
    description: INodeTypeDescription = {
        displayName: "String",
        name: "String",
        icon: "file:string.svg",
        type: 'base',
        version: 1,
        defaultVersion: 1,
        description: "Permite voce definir um valor fixo de texto.",
        defaults: {
            name: "String",
            handleActions: true,
        },
        inputs: [
        ],
        outputs: [
            {
                id: 'value',
                name: 'value',
                type: 'output.string'
            }
        ],
        properties: [
            {
                type: 'string',
                displayName: 'Text',
                name: 'value',
                displayInNode: true,
                placeholder: 'adicione algo...',
            },
        ]
    }

    getProperties(): INodeTypeDescription {
        return this.description;
    }

    getInputs(_: NodeParameterValueType) {
        return Promise.resolve({inputs: this.description.inputs});
    }
    
    test(_: NodeParameterValueType): Promise<any>{
        return Promise.resolve({test: []});
    }

    getOutputs(_: NodeParameterValueType) {
        return Promise.resolve({outputs: this.description.outputs});
    }

    execute(context: IExecuteFunctions): Promise<NodeOutput> {
        const value = context.nodeContext.getNodeParameter('value');
        return Promise.resolve({
            data: {
                value
            },
            
        })
    }
}