import { ScriptNodeMetadata } from "./Script";
import type { RegisterNodeMetadata } from "./types";

export const NODES: RegisterNodeMetadata[] = [
    ScriptNodeMetadata
];

export const NODE_TYPES = NODES.reduce((acc, { type, node }) => {
  acc[type] = node;
  return acc;
}, {} as Record<string, any>);