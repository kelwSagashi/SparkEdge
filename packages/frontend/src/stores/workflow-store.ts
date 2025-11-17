import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import type { INode } from '@/interfaces/nodes';
import * as uuid from 'uuid';
import type { INodeInputConfiguration, INodeOutputConfiguration, IWorkflowBase } from 'nmg8-workflow';


type WorkflowState = {
    workflow: IWorkflowBase<INode[], Edge[]>;
    isSaving: boolean;
    addNode: (node: INode) => void;
    setWorkflowName: (name: string) => void;
    setNode: (nodeId: string, node: INode) => void;
    setNodes: (nodes: INode[]) => void;
    getNodes: () => INode[];
    getNode: (nodeId: string) => INode | undefined;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: OnNodesChange<INode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    deleteNode: (nodeId: string) => void;
    deleteEdge: (edgeId: string) => void;
    updateNodeParameters: (nodeId: string, parameters: Record<string, any>) => void;
    updateNodeData: <T>(nodeId: string, data: T) => void;
    updateNodeInputs: (nodeId: string, inputs: INodeInputConfiguration[]) => void;
    updateNodeOutputs: (nodeId: string, inputs: INodeOutputConfiguration[]) => void;
    saveWorkflow: (id: string | undefined) => Promise<void>;
    loadWorkflow: (id: string) => Promise<void>;
    shareWorkflow: (id?: string) => void;
    duplicateWorkflow: (id?: string) => void;
    downloadWorkflow: (id?: string) => void;
    activeWorkflow: () => void;
    deactiveWorkflow: () => void;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    workflow: {
        id: uuid.v4(),
        nodes: [],
        edges: [],
        name: 'Fluxo Sem Titulo',
        isArchived: false,
        active: true
    },
    isSaving: false,

    setWorkflowName: (name) => set( 
        (state) => ({ 
            workflow: { 
                ...state.workflow,
                name
            }
        }
    )),
    setNodes: (nodes) => set(
        (state) => ({ 
            workflow: { 
                ...state.workflow,
                nodes
            }
        }
    )),

    setNode: (nodeId, node) => {
        const mapnodes = (n: INode) => {
                if (n.id === nodeId) {
                    return {
                        ...n,
                        ...node,
                    };
                }
                return node;
        };

        set(
            (state) => ({
                workflow: {
                    ...state.workflow,
                    nodes: state.workflow.nodes.map(mapnodes)
                }
            }
        ));
    },

    getNode: (nodeId) => get().workflow.nodes.find(node => node.id === nodeId),

    setEdges: (edges) => set(
        (state) => ({ 
            workflow: {
                ...state.workflow,
                edges
            }
        }
    )),

    addNode: (node) => {
        const unselectedNodes = get().workflow.nodes.map(n => ({ ...n, selected: false }));
        set(
            (state) => ({ 
                workflow: {
                    ...state.workflow,
                    nodes: [...unselectedNodes, node]
                }
            })
        );
    },

    getNodes: () => get().workflow.nodes,

    onNodesChange: (changes) => {
        set(
            (state) => ({
                workflow: {
                    ...state.workflow,
                    nodes: applyNodeChanges<INode>(changes, state.workflow.nodes),
                }
            })
        );
    },

    onEdgesChange: (changes) => {
        set(
            (state) => ({
                workflow: {
                    ...state.workflow,
                    edges: applyEdgeChanges(changes, state.workflow.edges),
                }
            })
        );
    },

    onConnect: (connection) => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    edges: addEdge({ ...connection, type: 'deletable' }, get().workflow.edges),
                }
            })
        );
    },

    deleteNode: (nodeId) => {
        set(
            (state) => ({
                workflow: {
                    ...state.workflow,
                    nodes: state.workflow.nodes.filter(n => n.id !== nodeId)
                }
            })
        );
    },

    deleteEdge: (edgeId: string) => {
        set(
            (state) => ({
                workflow: {
                    ...state.workflow,
                    edges: state.workflow.edges.filter((e) => e.id !== edgeId), 
                }
            })
        );
    },
    
    updateNodeParameters: (nodeId, newParams) => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    nodes: s.workflow.nodes.map((node) => {
                        if (node.id === nodeId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    parameters: { ...node.data.parameters, ...newParams },
                                },
                            };
                        }
                        return node;
                    }),
                }
            })
        );
    },
    
    updateNodeData: (nodeId, newData) => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    nodes: s.workflow.nodes.map((node) => {
                        if (node.id === nodeId) {
                            const newNode = {
                                ...node,
                                data: {
                                    ...node.data,
                                    ...newData
                                },
                            };
                            return newNode;
                        }

                        return node;
                    }),
                }
            })
        );
    },

    updateNodeInputs: (nodeId, newInputs) => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    nodes: s.workflow.nodes.map((node) => {
                        if (node.id === nodeId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    inputs: [...node.data.inputs, ...newInputs].filter((input, index, self) => {
                                        index === self.findIndex((t) => t.id === input.id || t.name === input.name)
                                    })
                                },
                            };
                        }
                        return node;
                    }),
                }
            })
        );
    },
    
    updateNodeOutputs: (nodeId, newOutputs) => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    nodes: s.workflow.nodes.map((node) => {
                        if (node.id === nodeId) {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    outputs: [...node.data.outputs, ...newOutputs].filter((output, index, self) => {
                                        index === self.findIndex((t) => t.id === output.id || t.name === output.name)
                                    })
                                },
                            };
                        }
                        return node;
                    }),
                }
            })
        );
    },

  
    shareWorkflow: (id?: string) => {
        console.log("Compartilhando fluxo...");
    },

    duplicateWorkflow: (id?: string) => {
        console.log("Duplicando projeto...");
    },

    downloadWorkflow: (id?: string) => {
        console.log("Baixando projeto...");
    },

    activeWorkflow: () => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    isActive: true
                }

            })
        );
    },

    deactiveWorkflow: () => {
        set(
            (s) => ({
                workflow: {
                    ...s.workflow,
                    isActive: false
                }

            })
        );
    },

    saveWorkflow: async (id) => {
        set({ isSaving: true });
        try {
            const { workflow } = get();
            // Substitua pela sua chamada de API real
            console.log('Salvando no backend:', JSON.stringify(workflow, null, 2));
            // await api.saveWorkflow(flowDefinition);
            // Adicionar feedback ao usuário (ex: toast de sucesso)
        } catch (error) {
            console.error("Failed to save workflow:", error);
            // Adicionar feedback ao usuário (ex: toast de erro)
        } finally {
          set({ isSaving: false });
        }
    },

    loadWorkflow: async (id) => {
        try {
            // Substitua pelo seu método de API real
            console.log(`Carregando workflow ${id} do backend...`);
            // const workflow = await api.loadWorkflow(id);
            // set({ nodes: workflow.nodes, edges: workflow.edges, workflowName: workflow.name });
        } catch (error) {
            console.error("Failed to load workflow:", error);
        }
    },
}));