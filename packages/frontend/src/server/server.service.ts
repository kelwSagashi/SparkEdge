
import type { INodeTypeDescription } from 'nmg8-workflow';
import axios from "axios";
import { interpolate } from "./executor/server-executor";
import type { INode } from "@/interfaces/nodes";
import type { DeclarativeRestApiSettings, IDataObject, INodeInputConfiguration, INodeOutputConfiguration, IWorkflowBase } from "nmg8-workflow";
import type { Edge } from "@xyflow/react";
import type { CredentialReturningValues, CredentialUpsertValues, DeviceReturningValues, DeviceUpsertValues, ProjectReturningValues, ReturningQueries, ServerEndpointsReturningValues, ServerEndpointsUpsertValues, ServerReturningValues, ServerTypeReturningValues, ServerUpsertValues, UserReturningValues } from 'nmg8-db/src/types'

const baseURL = "http://localhost:3009/api";

const axios_api_instance = axios.create({
    baseURL
});
axios_api_instance.defaults.withCredentials = true;

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

    async listWorkflowExecutions() {
        return axios_api_instance.get('/workflow-executions');
    }

    async listServersTypes() {
        const response = await axios_api_instance.get<ReturningQueries<ServerTypeReturningValues[]>>('/server-types');
        return response;
    }

    async listServers() {
        return axios_api_instance.get<ReturningQueries<ServerReturningValues[]>>('/servers');
    }

    async registerServer(payload: { 
        server: ServerUpsertValues; 
        authorization: CredentialUpsertValues; 
        endpoints: ServerEndpointsUpsertValues[]
    }) {
        const response = await axios_api_instance.post<ReturningQueries<{
            server: ServerReturningValues; 
            credential: CredentialReturningValues; 
            endpoints: ServerEndpointsReturningValues[] 
        }>>('/servers/register', payload);

        return response;
    }

    async createDevice(device: DeviceUpsertValues) {
        const response = await axios_api_instance.post<ReturningQueries<DeviceReturningValues | null>>('/devices', device);
        return response;
    }
    
    async getProject(userId: string, projectName: string = "PERSONAL") {
        const response = await axios_api_instance.get<ReturningQueries<{
            user: UserReturningValues, 
            project: ProjectReturningValues,
        } | null>>(`/users/project/${userId}/${projectName}`);
        return response;
    }

    async triggerWorkflowExecution(id: string) {
        return axios_api_instance.post(`/workflow-executions/${id}/trigger`);
    }

    async setWorkflowExecutionEnabled(id: string, enabled: boolean) {
        return axios_api_instance.put(`/workflow-executions/${id}/enable`, null, { params: { enabled: String(enabled) } });
    }

    async deleteWorkflowExecution(id: string) {
        return axios_api_instance.delete(`/workflow-executions/${id}`);
    }
}

export const api = new API();