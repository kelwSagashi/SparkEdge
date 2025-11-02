import { Workflow } from "./workflow";

export function randomInt(max: number): number;
export function randomInt(min: number, max: number): number;
/**
 * Generates a random integer within a specified range.
 *
 * @param {number} min - The lower bound of the range. If `max` is not provided, this value is used as the upper bound and the lower bound is set to 0.
 * @param {number} [max] - The upper bound of the range, not inclusive.
 * @returns {number} A random integer within the specified range.
 */
export function randomInt(min: number, max?: number): number {
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return min + (crypto.getRandomValues(new Uint32Array(1))[0] % (max - min));
}

export function buildGraph(workflow: Workflow) {
  const graph: Record<string, string[]> = {};

  // Inicializa todos os nós
  // for (const node of workflow.nodes) {
  //   graph[node.id] = [];
  // }

  // // Adiciona conexões (arestas)
  // for (const edge of workflow.edges) {
  //   graph[edge.source].push(edge.target);
  // }

  return graph;
}