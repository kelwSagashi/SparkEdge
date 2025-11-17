import { NodeType } from '@/type';
import {
    IExecuteFunctions, 
    INodeTypeDescription,
    NodeOutput,
    NodeParameterValueType
} from 'nmg8-workflow';

export class Trigger extends NodeType {
    description: INodeTypeDescription = {
        displayName: "Trigger",
        name: "Trigger",
        icon: "file:trigger.svg",
        type: 'base',
        version: 1,
        defaultVersion: 1,
        description: "Executa o workflow.",
        defaults: {
            name: "Trigger",
            handleActions: true,
        },
        inputs: [
        ],
        outputs: [
            {
                id: 'trigger',
                name: 'trigger',
                type: 'trigger'
            }
        ],
        properties: [
            {
                type: 'options',
                displayName: 'Trigger',
                name: 'trigger',
                displayInNode: true,
                options: [
                    {
						name: 'cron',
						value: 'cron',
                        description: 'cron',
					},
					{
						name: 'run once',
						value: 'run_once',
                        description: 'run once',
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
                },
                onSelect: [
                    {
                        
                    }
                ]
            },
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