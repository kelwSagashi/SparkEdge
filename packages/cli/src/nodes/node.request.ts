import { INode, AuthenticatedRequest, INodeType } from 'nmg8-workflow';

export declare namespace NodeRequest {
    type NodePayload = {
        node: INode;
    }

    type InvokeNodeClass = AuthenticatedRequest<{name: string, method: keyof INodeType}, {}, NodePayload, {}>;
}