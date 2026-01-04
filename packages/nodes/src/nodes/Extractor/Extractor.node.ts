import { NodeType } from '@/type';
import {
    IExecuteFunctions, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType
} from 'nmg8-workflow';

export class Extractor extends NodeType {
    description: INodeTypeDescription = {
        displayName: "Extractor",
        name: "Extractor",
        icon: "file:extractor.svg",
        type: 'base',
        version: 1,
        defaultVersion: 1,
        description: "You can extract a value of an object.",
        defaults: {
            name: "Extractor",
            handleActions: true,
        },
        inputs: [
            {
                id: 'data',
                name: 'data',
                type: 'object',
                required: true,
            }
        ],
        outputs: [
            {
                id: 'value',
                name: 'value',
                type: 'string'
            }
        ],
        properties: [
            {
                type: 'resourceMapper',
                displayName: 'Value',
                name: 'value',
                displayInNode: false,
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
        const data = context.nodeContext.getNodeParameter('data');
        return Promise.resolve({
            data: {
                nmg8_value: data
            },
            
        })
    }
}