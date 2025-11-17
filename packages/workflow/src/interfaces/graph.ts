export class GraphNode<T> {
    data: T;
    adjNodes: GraphNode<T>[];
    comparator: (a: T, b: T) => number;

    constructor(data: T, comparator: (a: T, b: T) => number) {
        this.data = data;
        this.adjNodes = new Array<GraphNode<T>>();
        this.comparator = comparator;
    }

    addNewNeighbour(node: GraphNode<T>): void {
        this.adjNodes.push(node);
    }

    removeNeighbour(data: T): GraphNode<T> | null {
        let index = this.adjNodes.findIndex(
            (node) => this.comparator(node.data, data) == 0
        );
        if (index != -1) {
            return this.adjNodes.splice(index, 1)[0];
        }
        return null;
    }
}

export class Graph<T> {
  nodes: Map<T, GraphNode<T>> = new Map<T, GraphNode<T>>();
  comparator: (a: T, b: T) => number;
  root: GraphNode<T> | null = null;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  addNewNode(data: T): GraphNode<T> {
    let node = this.nodes.get(data);
    if (node) return node;
    node = new GraphNode(data, this.comparator);
    this.nodes.set(data, node);
    return node;
  }

  addEdge(source: T, destination: T): void {
    const sourceNode = this.addNewNode(source);
    const destNode = this.addNewNode(destination);
    sourceNode.addNewNeighbour(destNode);
  }

  /** 
   * Encontra o nó inicial (aquele que não é destino de nenhuma aresta)
   */
  findRoot(): GraphNode<T> | null {
    const allNodes = Array.from(this.nodes.values());
    const destinations = new Set(
      allNodes.flatMap(n => n.adjNodes.map(a => a.data))
    );

    const root = allNodes.find(n => !destinations.has(n.data));
    this.root = root || null;
    return root || null;
  }

  /**
   * Verifica se o grafo possui ciclos (usando DFS)
   */
  hasCycle(): boolean {
    const visited = new Set<GraphNode<T>>();
    const stack = new Set<GraphNode<T>>();

    const dfs = (node: GraphNode<T>): boolean => {
      if (stack.has(node)) return true; // ciclo detectado
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      for (const neighbor of node.adjNodes) {
        if (dfs(neighbor)) return true;
      }

      stack.delete(node);
      return false;
    };

    for (const node of this.nodes.values()) {
      if (dfs(node)) return true;
    }

    return false;
  }

  /**
   * Verifica se o grafo é válido para execução:
   * - possui um nó inicial
   * - não possui ciclos
   * - todas as partes são alcançáveis
   */
  validate(): boolean {
    const root = this.findRoot();
    if (!root) {
      console.error('Nenhum nó inicial encontrado.');
      return false;
    }

    if (this.hasCycle()) {
      console.error('O grafo possui ciclos.');
      return false;
    }

    // Verifica se todos os nós são alcançáveis a partir do root
    const reachable = new Set<GraphNode<T>>();
    const dfs = (node: GraphNode<T>) => {
      if (reachable.has(node)) return;
      reachable.add(node);
      node.adjNodes.forEach(dfs);
    };
    dfs(root);

    if (reachable.size !== this.nodes.size) {
      console.error('Nem todos os nós são alcançáveis a partir do nó inicial.');
      return false;
    }

    return true;
  }

  _fallbackNodes(fallback: (data: T) => void) {
    for (const node of this.nodes.values()) {
        fallback(node.data);
    }
  }

  _iterableNodeValues(): IterableIterator<GraphNode<T>> {
    return this.nodes.values();
  }

  findNode(data: T, customComparator: (a: T, b: T) => number = this.comparator): GraphNode<T> | null {
    for (const node of this.nodes.values()) {
        
        if (customComparator(node.data, data) === 0) {
            return node;
        }
    }
    return null;
  }

  hasNode(data: T): boolean {
    return this.findNode(data) !== null;
  }

  getParentNodes(destination: T): T[] {
    const parents = new Set<T>();
    const stack = [destination];

    while (stack.length > 0) {
      const current = stack.pop()!;

      // procura quem aponta para o nó atual
      for (const [id, node] of this.nodes.entries()) {
        if (node.adjNodes.some((n) => this.comparator(n.data, current) === 0)) {
          if (!parents.has(id)) {
            parents.add(id);
            stack.push(id);
          }
        }
      }
    }

    parents.delete(destination);
    return Array.from(parents);
  }
}