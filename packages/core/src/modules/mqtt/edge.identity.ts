import { dbManager } from 'spark-edge-db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures this Spark Edge instance has a unique identity.
 * Identity is persisted in monitor.db via @spark-edge/db.
 */

/** Check if the edge has been provisioned (linked to Spark Cloud) */
export async function isProvisioned(): Promise<boolean> {
  const identity = dbManager.edge.getIdentity().data;
  return !!identity?.provisioned;
}

/** Get the full system identity details. Includes name and provisioned status. */
export async function getSystemIdentity(): Promise<{ edge_id: string | null; edge_name: string | null; provisioned: boolean }> {
  const { data: identity } = dbManager.edge.getIdentity();
  return {
    edge_id: identity?.edge_id || null,
    edge_name: identity?.edge_name || null,
    provisioned: !!identity?.provisioned
  };
}

/** Get the current Edge ID from persistence. Returns null if not provisioned. */
export async function getEdgeId(): Promise<string | null> {
  const identity = await getSystemIdentity();
  return identity.edge_id;
}

/** 
 * Link this Edge with a permanent ID from Spark Cloud.
 * This effectively marks the device as 'Provisioned'.
 */
export async function setCloudEdgeId(edgeId: string, edgeName: string): Promise<void> {
  dbManager.edge.upsertIdentity({
    edge_id: edgeId,
    edge_name: edgeName,
    provisioned: 1
  });
}

/** Update the local display name for this Edge */
// Removed as requested

/** Remove the identity (on disconnect/reset) */
export async function clearEdgeIdentity(): Promise<void> {
  dbManager.edge.clearIdentity();
}

/** 
 * Force regenerate the local Edge ID.
 * Warning: This will break existing cloud links if provisioned.
 */
export async function regenerateEdgeId(): Promise<string | null> {
  await clearEdgeIdentity();
  return await getEdgeId();
}
