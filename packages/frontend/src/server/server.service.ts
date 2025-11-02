import type { ServerEndpointsReturningValues, ServerReturningValues } from "nmg8-db/src/types/index.ts";
import type { INodeTypeDescription } from 'nmg8-workflow/src/index.ts';
import axios from "axios";
import { interpolate } from "./executor/server-executor";

const axios_api_instance = axios.create({
    baseURL: "http://localhost:3000/api",
})
export class API {
    async getNodeDescription({
        type
    }: { type: string }) {
        const response = axios_api_instance.get<INodeTypeDescription>(`/nodes/${type}/description`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        return response;
    }

    async execute({
        endpoint,
        server,
        body,
        params
    }: {
        server: ServerReturningValues,
        endpoint: ServerEndpointsReturningValues,
        params?: Record<string, string>,
        body?: any
    }) {
        const response = await axios.request({
            baseURL: server.base_url,
            url: interpolate(endpoint.path, params),
            method: endpoint.method,
            data: body
        });

        return response;
    }
}

export const api = new API();