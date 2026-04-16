import { Driver } from './driver.interface';

export interface SupabaseDriverConfig {
  url: string;
  apiKey: string;
}

export class SupabaseDriver implements Driver {
  constructor(private config: SupabaseDriverConfig) {}

  async connect(): Promise<void> {
    // Basic validation
    if (!this.config.url || !this.config.apiKey) {
      throw new Error('Supabase URL and API Key are required');
    }
  }

  async disconnect(): Promise<void> {
    // Stateless
  }

  async request(params: {
    table: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<any> {
    let url = params.table ? `${this.config.url}/rest/v1/${params.table}` : `${this.config.url}/rest/v1/`;
    
    if (params.method === 'GET' && params.params) {
      const query = new URLSearchParams(params.params).toString();
      if (query) url += `?${query}`;
    }

    const response = await fetch(url, {
      method: params.method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.config.apiKey,
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Prefer': 'return=minimal',
        ...params.headers,
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase Error ${response.status}: ${errorText}`);
    }

    return response.json().catch(() => ({}));
  }

  async getSchema(): Promise<any> {
    const url = `${this.config.url}/rest/v1/`;
    const response = await fetch(url, {
      headers: {
        'apikey': this.config.apiKey,
        'Authorization': `Bearer ${this.config.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Supabase Schema: ${response.statusText}`);
    }

    return response.json();
  }
}
