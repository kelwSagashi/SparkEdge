import { useCallback } from 'react';
import { type Connection, type Edge, getOutgoers, type Node } from '@xyflow/react';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useShallow } from 'zustand/react/shallow';

const hasPath = (
  currentNodeId: string,
  targetNodeId: string,
  nodes: Node[],
  edges: Edge[],
  visited: Set<string> = new Set<string>()
): boolean => {
  if (currentNodeId === targetNodeId) {
    return true;
  }
  if (visited.has(currentNodeId)) {
    return false;
  }
  visited.add(currentNodeId);

  const currentNode = nodes.find(n => n.id === currentNodeId);
  if (!currentNode) return false;

  const outgoers = getOutgoers(currentNode, nodes, edges);
  for (const outgoer of outgoers) {
    if (hasPath(outgoer.id, targetNodeId, nodes, edges, visited)) {
      return true;
    }
  }

  return false;
};


export function useIsValidConnection() {
  const [ nodes, edges ] = useWorkflowStore(useShallow(state => [ state.workflow.nodes, state.workflow.edges ]));

  return useCallback(
    (connection: Connection | Edge): boolean => {
      if (connection.source === connection.target) {
        return false;
      }
      
      const targetNode = nodes.find(n => n.id === connection.target);
      if (!targetNode) return false;
      const createsCycle = hasPath(connection.target!, connection.source!, nodes, edges);
      
      return !createsCycle;
    },
    [nodes, edges],
  );
}