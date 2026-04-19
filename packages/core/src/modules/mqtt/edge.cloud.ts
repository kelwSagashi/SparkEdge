/**
 * Spark Cloud API client for Edge registration.
 *
 * This module handles the two-step cloud provisioning flow:
 *  Step 1 — POST /auth/login        → get user JWT (ephemeral, never persisted)
 *  Step 2 — POST /edges/register    → register Edge, receive MQTT credentials
 *
 * The JWT is used only during the session and discarded immediately after.
 * MQTT credentials returned by the server are the permanent identity.
 */

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

const DEFAULT_SPARK_URL = process.env.SPARK_API_URL ?? 'https://api.sparkmon.io';

/**
 * Authenticate the user with the Spark cloud.
 * Returns an ephemeral JWT — NEVER stored to disk.
 */
export async function cloudLogin(
  email: string,
  password: string,
  sparkApiUrl: string = DEFAULT_SPARK_URL
): Promise<CloudLoginResult> {
  const url = `${sparkApiUrl}/auth/login`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    throw new Error(`[Cloud] Cannot reach Spark API at ${sparkApiUrl}: ${err.message}`);
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

/**
 * Register a new Edge instance with the Spark cloud.
 * Uses the ephemeral user JWT acquired from cloudLogin().
 * Returns the permanent MQTT credentials for this edge.
 */
export async function registerEdge(
  options: {
    userToken: string;
    edgeName: string;
    sparkApiUrl?: string;
  }
): Promise<EdgeRegistrationResult> {
  const sparkApiUrl = options.sparkApiUrl ?? DEFAULT_SPARK_URL;
  const url = `${sparkApiUrl}/edges/register`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.userToken}`,
      },
      body: JSON.stringify({ name: options.edgeName, user_token: options.userToken }),
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
