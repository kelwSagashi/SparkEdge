import type { ServerEndpointsReturningValues, ServerReturningValues } from "@nmg8/db/src/services";

export const Servers: ServerReturningValues[] = [
    {
        id: "server_local_1",
        name: "Json placeholder",
        base_url: "https://jsonplaceholder.typicode.com",
        type: "1",
        created_at: "2025-10-11T14:20:00.000Z",
        updated_at: "2025-10-11T14:20:00.000Z",
        auth_type: "No Auth",
        authorization: {},
        headers: {}
    }
];

export const Paths: ServerEndpointsReturningValues[] = [
    {
        id: "1",
        server_id: "server_local_1",
        method: "GET",
        path: "/todos/{{id}}",
        name: "list todos",
        description: "",
        created_at: "2025-10-11T14:20:00.000Z",
        updated_at: "2025-10-11T14:20:00.000Z",
        headers: {},
        payload_schema: "",
        response_schema: ""
    },
    {
        id: "2",
        server_id: "server_local_1",
        method: "GET",
        path: "/comments?postId={{postId}}",
        name: "liest comments by post",
        description: "",
        created_at: "2025-10-11T14:20:00.000Z",
        updated_at: "2025-10-11T14:20:00.000Z",
        headers: {},
        payload_schema: "",
        response_schema: ""
    },
    {
        id: "3",
        server_id: "server_local_1",
        method: "GET",
        path: "/users",
        name: "users",
        description: "",
        created_at: "2025-10-11T14:20:00.000Z",
        updated_at: "2025-10-11T14:20:00.000Z",
        headers: {},
        payload_schema: "",
        response_schema: ""
    },

]