import type { INodeType } from "../interfaces/node";

export type NodeConstructor = new () => INodeType;

class NodeRegistry {
	private static registry = new Map<string, NodeConstructor>();

	static register(name: string, node: NodeConstructor) {
		this.registry.set(name, node);
	}

	static get(name: string): NodeConstructor | undefined {
		return this.registry.get(name);
	}

	static list(): string[] {
		return [...this.registry.keys()];
	}
}

export { NodeRegistry };
