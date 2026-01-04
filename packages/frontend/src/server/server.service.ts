
import type { INodeTypeDescription } from 'nmg8-workflow';
import axios from "axios";
import { interpolate } from "./executor/server-executor";
import type { INode } from "@/interfaces/nodes";
import type { DeclarativeRestApiSettings, IDataObject, INodeInputConfiguration, INodeOutputConfiguration, IWorkflowBase } from "nmg8-workflow";
import type { Edge } from "@xyflow/react";
import type { ServerEndpointsReturningValues, ServerReturningValues } from 'nmg8-db/src/types'

const baseURL = "http://localhost:3000/api";

const axios_api_instance = axios.create({
    baseURL
});

export type APIBaseRequest<T = unknown> = {
    server: ServerReturningValues,
    endpoint: ServerEndpointsReturningValues,
    params?: Record<string, string>,
    body?: T
}
export class API {
    async getNodeDescription({
        name
    }: { name: string }) {
        const response = axios_api_instance.get<INodeTypeDescription>(`/nodes/${name}/description`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        return response;
    }
    
    async getNodes() {
        const response = axios_api_instance.get<{nodes: Partial<INodeTypeDescription>[]}>(`/nodes`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        return response;
    }

    async getNodeInputs({
        name,
        node
    }: { name: string, node: INode }) {
        const response = axios_api_instance.post<{
            inputs: Array<INodeInputConfiguration>, 
            outputs: Array<INodeOutputConfiguration>
        }>(`/nodes/${name}/io`, {
            node
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        return response;
    }

    async execute<T = IDataObject>({
        request,
        params
    }: {
        request: DeclarativeRestApiSettings.HttpRequestOptions;
        params?: Record<string, string>;
    }) {
        const response = await axios.request<T>({
            baseURL: request.baseURL ?? baseURL,
            url: interpolate(request.url, params),
            method: request.method,
            data: request.body,
            auth: request.auth,
            headers: request.headers as any
        });

        return response;
    }


    async runTestNode({
        node
    }: {
        node: INode
    }) {
        const response = await axios_api_instance.post('/nodes/run/test', {
            node
        });

        return response;
    }

    async runWorkflowTest({
        workflow,
        destinationNode
    }: {
        workflow: IWorkflowBase<INode[], Edge[]>,
        destinationNode?: string
    }) {
        const response = await axios_api_instance.post('/workflows/run/test', {
            workflow,
            destinationNode,
        });

        return response;
    }
}

export const api = new API();