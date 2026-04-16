import { BaseAdapter, CredentialAdapter, AdapterMetadata } from "../adapter-base";
import { HttpDriver } from "../drivers/http.driver";
import { HttpServerType } from "../server-types";

@CredentialAdapter()
export class HttpNoAuthAdapter extends BaseAdapter {
  static readonly metadata: AdapterMetadata = {
    name: "No Auth",
    strategy: "http_noauth",
    id: "no_auth",
    server_type_id: HttpServerType,
    fields: [],
    resourceFields: [
        { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com' }
    ],
    operationFields: [
        { key: 'method', label: 'Method', type: 'select', options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' }
        ]},
        { key: 'path', label: 'Path', type: 'text', placeholder: '/v1/resource' }
    ]
  };

  private driver: HttpDriver;

  constructor(...args: ConstructorParameters<typeof BaseAdapter>) {
    super(...args);
    const resourceConfig = this.resource.config as any;
    const { baseUrl } = resourceConfig;
    
    this.driver = new HttpDriver({
      baseUrl,
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
    const config = this.operation.config as any;
    const method = config?.method || 'GET';
    return await this.driver.request({ method, path: '/' });
  }
}