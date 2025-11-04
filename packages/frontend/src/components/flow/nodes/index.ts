import type { RegisterNodeMetadata } from "@/interfaces";
import { BaseNodeMetadata } from "./Base";

export const NODES: RegisterNodeMetadata[] = [
  BaseNodeMetadata
];

export const NODE_TYPES = NODES.reduce((acc, { types, group, node }) => {
  types.forEach((type) => {
    acc[`${group}.${type}`] = node;
  });
  return acc;
}, {} as Record<string, any>);