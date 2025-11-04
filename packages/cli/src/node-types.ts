import { Service } from "@nmg8/di";
import { INodeType, INodeTypes } from 'nmg8-workflow'
import { LoadNodes } from "./load-nodes";

@Service()
export class NodeTypes implements INodeTypes {
    constructor(
        private readonly loadNode: LoadNodes
    ) {}
    getByName(nodeType: string): INodeType {
        return this.loadNode.getNode(nodeType).type;
    }
}