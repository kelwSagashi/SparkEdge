import { Driver } from './driver.interface';

export interface HttpDriverConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    in?: 'header' | 'query';
  };
}

export class HttpDriver implements Driver {
  constructor(private config: HttpDriverConfig) {}

  async connect(): Promise<void> {
    // HTTP is stateless, but we could validate baseUrl here
  }

  async disconnect(): Promise<void> {
    // Nothing to do for HTTP
  }

  async request(params: {
    method: string;
    path: string;
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }): Promise<any> {
    const url = new URL(params.path, this.config.baseUrl);
    
    // Add query params from config
    if (this.config.auth?.type === 'apikey' && this.config.auth.in === 'query') {
      url.searchParams.append(this.config.auth.key!, this.config.auth.value!);
    }
    if (params.params) {
      for (const [k, v] of Object.entries(params.params)) {
        url.searchParams.append(k, v);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...params.headers,
    };

    // Add auth headers
    if (this.config.auth) {
      if (this.config.auth.type === 'bearer') {
        headers['Authorization'] = `Bearer ${this.config.auth.token}`;
      } else if (this.config.auth.type === 'basic') {
        const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      } else if (this.config.auth.type === 'apikey' && this.config.auth.in === 'header') {
        headers[this.config.auth.key!] = this.config.auth.value!;
      }
    }

    const response = await fetch(url.toString(), {
      method: params.method,
      headers,
      body: params.body && (params.method !== 'GET') ?
        JSON.stringify(params.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    return response.json().catch(() => ({}));
  }
}

