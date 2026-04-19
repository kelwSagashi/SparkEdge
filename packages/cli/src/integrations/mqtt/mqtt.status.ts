import { dbManager } from 'spark-edge-db';
import os from 'os';

/**
 * Reads location from the local edge_config table (via @spark-edge/db).
 * Falls back to null if not configured.
 */

interface Location {
  lat: string | null;
  lng: string | null;
  source: string;
}

export function getLocation(): Location {
  try {
    const row = dbManager.edge.getEdgeConfig().data;
    if (row) {
      return { 
        lat: row.lat ?? null, 
        lng: row.lng ?? null, 
        source: row.location_source ?? 'manual' 
      };
    }
  } catch {
    // table may not exist yet or other issues → no-op
  }
  return { lat: null, lng: null, source: 'none' };
}

export async function getSystemInfo(): Promise<{ version: string; uptime: number; hostname: string }> {
  return {
    version: process.env.npm_package_version ?? '0.0.0',
    uptime: process.uptime(),
    hostname: os.hostname(),
  };
}
