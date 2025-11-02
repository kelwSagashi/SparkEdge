import { Service } from "@nmg8/di";
import { INodeTypeData, Types } from "nmg8-workflow";
import { Script } from 'nmg8-nodes'

@Service()
export class LoadNodes{
    // private known: KnownNodesAndCredentials = { nodes: {} };

    registry: INodeTypeData;

    types: Types = { nodes: [] };

    // loaders: Record<string, DirectoryLoader> = {};

    constructor(
        
    ) {
        this.registry = new Map();
        
        this.registry.set("script", { sourcePath: "", type: new Script });
    }

    getLoaded() {
        return this.registry;
    }

    getNode(name: string) {
        return this.registry.get(name);
    }
}