/**
 * Spark Cloud API client for Edge registration.
 *
 * This module handles the two-step cloud provisioning flow:
 *  Step 1 — POST /auth/login        → get user JWT (ephemeral, never persisted)
 *  Step 2 — POST /edges/register    → register Edge, receive MQTT credentials
 *
 * The JWT is used only during the session and discarded immediately after.
 * MQTT credentials returned by the server are the permanent identity.
 *
 * Cloud URL priority: spark-edge.config.yml → SPARK_CLOUD_URL env → default
 */

import { appConfig } from '../../config/cloud-integration.config';

export interface CloudLoginResult {
  token: string;
}

export interface EdgeRegistrationResult {
  edge_id: string;
  edge_name: string;
  mqtt: {
    url: string;
    username: string;
    password: string;
  };
}

/**
 * Authenticate the user with the Spark cloud.
 * Returns an ephemeral JWT — NEVER stored to disk.
 */
export async function cloudLogin(
  email: string,
  password: string,
  sparkCloudApiUrl: string
): Promise<CloudLoginResult> {
  const url = `${sparkCloudApiUrl}/auth/login`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    throw new Error(`[Cloud] Cannot reach Spark API at ${sparkCloudApiUrl}: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[Cloud] Login failed (${res.status}): ${body || res.statusText}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error('[Cloud] Login response missing token field.');
  }

  return { token: data.token };
}

/** Lazily-resolved cloud URL — reads from CloudIntegration config at call time */
const getCloudUrl = () => appConfig.cloud.url;

/**
 * Register a new Edge instance with the Spark cloud.
 * Uses the ephemeral user JWT acquired from cloudLogin().
 * Returns the permanent MQTT credentials for this edge.
 */
export async function registerEdge(
  options: {
    userToken: string;
    edgeName: string;
    metadata?: {
      lat?: string | null;
      lng?: string | null;
      tags?: string[];
      description?: string | null;
      os?: string;
      os_version?: string;
      edge_version?: string;
      hardware?: string;
      environment?: string;
    };
  }
): Promise<EdgeRegistrationResult> {
  const url = `${getCloudUrl()}/edges/register`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.userToken}`,
      },
    body: JSON.stringify({ 
      name: options.edgeName, 
      user_token: options.userToken,
      ...options.metadata 
    }),
  });
} catch (err: any) {
  throw new Error(`[Cloud] Cannot reach Spark API: ${err.message}`);
}

if (!res.ok) {
  const body = await res.text().catch(() => '');
  throw new Error(`[Cloud] Edge registration failed (${res.status}): ${body || res.statusText}`);
}

const data = (await res.json()) as Partial<EdgeRegistrationResult>;

if (!data.edge_id || !data.mqtt?.url || !data.mqtt?.username || !data.mqtt?.password) {
  throw new Error('[Cloud] Invalid registration response — missing required fields.');
}

return data as EdgeRegistrationResult;
}

/**
* Pair a new Edge using a short-lived pairing token.
* This is the modern replacement for user JWT based registration.
*/
export async function pairWithToken(
token: string,
edgeName?: string,
metadata?: any
): Promise<EdgeRegistrationResult> {
const url = `${getCloudUrl()}/edges/pair`;
console.log(`[EDGE] pair url ${url}`)

let res: Response;
try {
  res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      token, 
      edge_name: edgeName,
      name: edgeName, // Consistency
      metadata 
    }),
    });
  } catch (err: any) {
    throw new Error(`[Cloud] Cannot reach Spark API at ${url}: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText })) as any;
    throw new Error(`[Cloud] Pairing failed (${res.status}): ${body.message || res.statusText}`);
  }

  const data = (await res.json()) as Partial<EdgeRegistrationResult>;

  if (!data.edge_id || !data.mqtt?.url || !data.mqtt?.username || !data.mqtt?.password) {
    throw new Error('[Cloud] Invalid pairing response — missing required fields.');
  }

  return data as EdgeRegistrationResult;
}

/**
 * Signal the Spark Cloud to unpair and remove this Edge identity.
 * This is a synchronous operation used before local data wipe.
 */
export async function unpairWithCloud(edgeId: string): Promise<void> {
  const url = `${getCloudUrl()}/edges/unpair`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edgeId }),
    });
  } catch (err: any) {
    throw new Error(`[Cloud] Cannot reach Spark API at ${url}: ${err.message}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText })) as any;
    throw new Error(`[Cloud] Unpairing failed (${res.status}): ${body.message || res.statusText}`);
  }
}
