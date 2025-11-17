import { Service } from "@nmg8/di";
import { INodeTypeData, Types } from "nmg8-workflow";
import { NodeRegistry } from "./node-registry";

@Service()
export class LoadNodes {
    // private known: KnownNodesAndCredentials = { nodes: {} };

    registry: INodeTypeData;

    types: Types = { nodes: [] };

    // loaders: Record<string, DirectoryLoader> = {};

    constructor(
        private readonly nodeRegistry: NodeRegistry
    ) {
        this.registry = this.nodeRegistry.getNodes();
    }

    getLoaded() {
        return this.registry;
    }

    getLoadedNames() {
        const loadedClasses = [];
        for (const node of this.registry.values()) {
            loadedClasses.push({
                name: node.type.description.name,
                displayName: node.type.description.displayName,
                description: node.type.description.description,
                version: node.type.description.version
            });
        }
        return {nodes: loadedClasses};
    }

    getNode(name: string) {
        const node = this.registry.get(name);
        if (!node) {
            throw new Error(`${name} not found!`)
        }

        return node;
    }
}