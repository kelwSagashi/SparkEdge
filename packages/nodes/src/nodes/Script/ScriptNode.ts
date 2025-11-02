import { 
    DeclarativeRestApiSettings, 
    INodeIOPosition, 
    INodeType, 
    INodeTypeDescription
} from 'nmg8-workflow'

export const configuredOutputs = (parameters: DeclarativeRestApiSettings.HttpRequestOptions) => {
    const httpMethod = parameters.method;

    return [
        {
            type: 'main',
            displayName: httpMethod,
        },
    ];
};

export class Script implements INodeType {
    description: INodeTypeDescription = {
        type: 'script',
        displayName: "Script",
        name: "Script",
        icon: "file:script.svg",
        group: 'base',
        version: 1,
        defaultVersion: 1,
        description: "Executa o script selecionado.",
        defaults: {
            name: "Script",
            handleActions: true,
        },
        inputs: [
            {
                id: 'script_input_0',
                type: 'main',
                category: 'device',
                displayName: 'argumentos',
                maxConnections: 1,
                position: INodeIOPosition.Left
            },
        ],
        outputs: [
            {
                id: 'script_output_0',
                type: 'main',
                category: 'stdout',
                position: INodeIOPosition.Right,
                displayName: 'Saída'
            },
            {
                id: 'script_output_1',
                type: 'main',
                category: 'stderr',
                position: INodeIOPosition.Right,
                displayName: 'Erro'
            }
        ],
        properties: [
            {
                displayName: 'Selecionar Script',
                name: 'script',
                type: 'scriptSelector',
                required: true,
                routing: {
                    request: {
                        url: '/scripts',
                        method: 'GET',
                    }
                }
            },
        ]
    }

    getProperties(): INodeTypeDescription {
        return this.description;
    }
}