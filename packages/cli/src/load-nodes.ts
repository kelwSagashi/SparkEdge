import { Service } from "@nmg8/di";
import { NodeRegistry } from "nmg8-nodes";
import { INodeTypeData, Types } from "nmg8-workflow";

@Service()
export class LoadNodes{
    // private known: KnownNodesAndCredentials = { nodes: {} };

    registry: INodeTypeData;

    types: Types = { nodes: [] };

    // loaders: Record<string, DirectoryLoader> = {};

    constructor(
        private readonly nodeRegistry: NodeRegistry
    ) {
        this.registry = this.nodeRegistry.getLoaded();
    }

    getLoaded() {
        return this.registry;
    }

    getNode(name: string) {
        const node = this.registry.get(name);
        if (!node) {
            throw new Error(`${name} not found!`)
        }

        return node;
    }
}