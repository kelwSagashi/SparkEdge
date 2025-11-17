import { INode, IEdge, IWorkflowSettings } from "nmg8-workflow";
import { WorkflowReturningValues } from "./types";

interface Entity extends Omit<WorkflowReturningValues, 'id' | 'isArchived'> {
    id?: string | undefined;
    isArchived?: boolean;
}

export class WorkflowEntity implements Entity {
    id?: string | undefined;
    name: string;
    nodes: INode[];
    edges: IEdge[];
    active: boolean | null;
    isArchived?: boolean;
    settings: IWorkflowSettings;

    constructor(values: Entity) {
        this.id = values.id;
        this.name = values.name;
        this.nodes = values.nodes;
        this.edges = values.edges;
        this.active = values.active;
        this.isArchived = values.isArchived;
        this.settings = values;
    }
}