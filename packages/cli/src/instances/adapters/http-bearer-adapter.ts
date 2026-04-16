import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { HttpDriver } from "../drivers/http.driver";
import { HttpServerType } from "../server-types";

@CredentialAdapter()
export class HttpBearerAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "HTTP Bearer Token",
    strategy: "http_bearer",
    id: "bearer_token",
    server_type_id: HttpServerType,
    fields: [
        { key: 'token', label: 'Token (Bearer)', type: 'password' }
    ],
    resourceFields: [
        { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com' }
    ],
    operationFields: [
        { key: 'method', label: 'Method', type: 'select', options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' }
        ]},
        { key: 'path', label: 'Path', type: 'text', placeholder: '/v1/resource' }
    ]
  };

  private driver: HttpDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const { token } = this.credentialData;
    const { baseUrl } = this.resource.config as any;
    
    this.driver = new HttpDriver({
      baseUrl,
      auth: {
        type: 'bearer',
        token
      },
      headers: this.headers
    });
  }

  async send(payload: any) {
    const config = this.operation.config as any;
    const method = config?.method || 'POST';
    const path = config?.path || '/';
    
    return await this.driver.request({
      method,
      path,
      body: payload
    });
  }

  async test() {
    await this.driver.connect();
    // Test base URL
    const config = this.operation.config as any;
    const method = config?.method || 'GET';
    return await this.driver.request({ method, path: '/' });
  }
}