import { dbManager } from 'spark-edge-db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures this Spark Edge instance has a unique identity.
 * Identity is persisted in monitor.db via @spark-edge/db.
 */

/** Check if the edge has been provisioned (linked to Spark Cloud) */
export function isProvisioned(): boolean {
  const identity = dbManager.edge.getIdentity().data;
  return !!identity?.provisioned;
}

/** Get or create a local Edge ID. This ID is used as clientId if not provisioned. */
export function getOrCreateEdgeId(): string {
  const identity = dbManager.edge.getIdentity().data;
  
  if (identity?.edge_id) {
    return identity.edge_id;
  }

  const newId = `edge-${uuidv4()}`;
  dbManager.edge.upsertIdentity({ 
    edge_id: newId, 
    provisioned: 0 
  });
  
  return newId;
}

/** 
 * Link this Edge with a permanent ID from Spark Cloud.
 * This effectively marks the device as 'Provisioned'.
 */
export function setCloudEdgeId(edgeId: string, edgeName: string): void {
  dbManager.edge.upsertIdentity({
    edge_id: edgeId,
    edge_name: edgeName,
    provisioned: 1
  });
}

/** Remove the identity (on disconnect/reset) */
export function clearEdgeIdentity(): void {
  dbManager.edge.clearIdentity();
}
