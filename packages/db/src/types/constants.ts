export const DeviceConnectionMethods = ["none", "serial", "tcp", "udp"] as const;

export const ServerEndpointMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

export const AuthorizationTypes = ['No Auth', 'API Key', 'Bearer Token', 'Basic Auth', 'Digest Auth'] as const;