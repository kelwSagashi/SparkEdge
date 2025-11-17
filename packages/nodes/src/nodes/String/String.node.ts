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
                id: 'string_text',
                name: 'string',
                type: 'output.string'
            }
        ],
        properties: [
            {
                type: 'string',
                displayName: 'Text',
                name: 'text',
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
        const text = context.nodeContext.getNodeParameter('text');
        return Promise.resolve({
            data: {
                text
            }
        })
    }
}