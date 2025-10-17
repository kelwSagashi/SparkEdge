import type { ServerTypeReturningValues } from "./db.service.d";

export const DefaultServerTypes: ServerTypeReturningValues[] = [
    {
        id: "http",
        type: "http",
        name: "Servidor HTTP REST",
        description: "http, https, rest services are running as a service that u can consult via http request"
    }
]