import { axios_api_instance } from '@/server/instance';
import { request } from './utils';

const BASE = '/api';

export interface CloudStatus {
  connected: boolean;
  edge_id: string | null;
  mqtt: {
    connected: boolean;
  };
}

export interface ConnectPayload {
  email: string;
  password: string;
  edge_name?: string;
}

export interface ConnectResult {
  success: boolean;
  edge_id: string;
  edge_name: string;
  mqtt: { connected: boolean };
}

export const cloudService = {
  getStatus: (): Promise<CloudStatus> => axios_api_instance.get(`/cli/status`),

  connect: (payload: ConnectPayload): Promise<ConnectResult> =>
    axios_api_instance.post(`/cli/connect`, payload),

  disconnect: (): Promise<{ success: boolean }> =>
    axios_api_instance.post(`/cli/disconnect`),

  reconnect: (): Promise<{ success: boolean; mqtt: { connected: boolean } }> =>
    axios_api_instance.post(`/cli/reconnect`),
};
