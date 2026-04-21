import { axios_api_instance } from '@/server/instance';
import { request } from './utils';
import type { ReturningQueries } from 'spark-edge-db/src/types';

const BASE = '/api';

export interface CloudStatus {
  connected: boolean;
  edge_id: string | null;
  edge_name: string | null;
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
  getStatus: (): Promise<ReturningQueries<CloudStatus>> => axios_api_instance.get(`/cli/status`),

  getOnboarding: (): Promise<ReturningQueries<{ complete: boolean; data: any }>> => axios_api_instance.get(`/cli/onboarding`),

  saveOnboarding: (data: { name: string; lat: string; lng: string; tags: string[] }): Promise<ReturningQueries<{ success: boolean }>> => axios_api_instance.post(`/cli/onboarding`, data),

  connect: (payload: ConnectPayload): Promise<ConnectResult> =>
    axios_api_instance.post(`/cli/connect`, payload),

  disconnect: (): Promise<{ success: boolean }> =>
    axios_api_instance.post(`/cli/disconnect`),

  reconnect: (): Promise<{ success: boolean; mqtt: { connected: boolean } }> =>
    axios_api_instance.post(`/cli/reconnect`),
};
