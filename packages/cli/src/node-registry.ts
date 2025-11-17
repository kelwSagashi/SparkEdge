import { Service } from "@nmg8/di";
import fg from "fast-glob";
import { INodeTypeData, KnownNodes, Types } from "nmg8-workflow";
import path from "node:path";
import { CLI_DIR } from "./constants";
import { Class, DefaultNodeLoader, DirectoryLoader } from "nmg8-core";

@Service()
export class NodeRegistry {
    private known: KnownNodes = { nodes: {} };

    directory: string = "";

    loaders: Record<string, DirectoryLoader> = {};

    constructor(
        
    ) {
    }

    async init() {
        await this.loadNodes();
        await this.postProcessLoaders();
    }

    async postProcessLoaders() {

    }

    async loadNodes() {

        const basePathsToScan = [
			// In case "n8n" package is in same node_modules folder.
			path.join(CLI_DIR, '..'),
			// In case "n8n" package is the root and the packages are
			// in the "node_modules" folder underneath it.
			// path.join(CLI_DIR, 'node_modules'),
		];

		for (const nmg8Dir of basePathsToScan) {
			await this.loadNodesFromNodesPackage(nmg8Dir, 'nodes/dist/src/*');
		}
    }



    private async loadNodesFromNodesPackage(
		directory: string,
		packageName: string,
	): Promise<void> {
        const globOptions: fg.Options = {
			cwd: directory,
			onlyDirectories: true,
			deep: 1,
            absolute: true,
            ignore: ['**/type/**']
		};
		const nodesDirectory = await fg.glob(packageName, {...globOptions});

        for (const packagePath of nodesDirectory) {
			await this.runDirectoryLoader(DefaultNodeLoader, packagePath);
		}
    } 

    private async runDirectoryLoader<T extends DirectoryLoader>(
        constructor: Class<T, ConstructorParameters<typeof DirectoryLoader>>,
        dir: string
    ) {
        const loader = new constructor(dir);
        try {
            await loader.loadAll();
            this.loaders[loader.packageName] = loader;
        } catch (error) {
            
        }
        

        return loader;
    }

    getNodes() {
        const {loaders} = this;

        const nodeTypes: INodeTypeData[] = [];

        Array.from(Object.entries(loaders)).forEach(([_, loader]) => {
            nodeTypes.push(loader.nodeTypes)
        });

        const nodeTypeData: INodeTypeData = new Map()
        for (const nodeType of nodeTypes) {
            nodeType.forEach((value, key) => {
                nodeTypeData.set(key, value);
            })
        }

        return nodeTypeData;
    }

    getNode(packageName: string, name: string) {
        const { loaders } = this;
        const loader = loaders[packageName];
        if (!loader) {
			throw new Error("Loader Not Found");
		}
        return loader.getNode(name);
    }
}