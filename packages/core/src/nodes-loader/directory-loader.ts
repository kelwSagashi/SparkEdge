import {realpathSync} from 'node:fs';
import { INodeType, INodeTypeData } from "nmg8-workflow";
import path from 'path';

export abstract class DirectoryLoader {
	// Stores the loaded descriptions and sourcepaths
	nodeTypes: INodeTypeData = new Map();

	constructor(
		readonly directory: string,
		protected excludeNodes: string[] = [],
		protected includeNodes: string[] = [],
	) {
		// If `directory` is a symlink, we try to resolve it to its real path
		try {
			this.directory = realpathSync(directory);
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (error.code !== 'ENOENT') throw error;
		}
	}

	abstract packageName: string;

	abstract loadAll(): Promise<void>;

    async loadNodeFromFile(filePath: string){
        const tempNode = await this.loadClass<INodeType>(filePath);

        this.nodeTypes.set(tempNode.description.name, {
            sourcePath: filePath,
            type: tempNode
        });
		const res = await tempNode.test?.(undefined);
		
    }

    private async loadClass<T>(sourcePath: string) {
        const [className] = path.parse(sourcePath).name.split('.');
        

        try {
            return loadClassInIsolation<T>(sourcePath, className);
        } catch (error) {
            throw error;
        }
    }

    getNode(name: string) {
        const { nodeTypes } = this;
        return nodeTypes.get(name);
    }
}


import {createContext, Script} from 'vm';

const context = createContext({ require });
export const loadClassInIsolation = <T>(filePath: string, className: string, inTest: boolean = false) => {
	if (process.platform === 'win32') {
		filePath = filePath.replace(/\\/g, '/');
	}

	// Note: Skip the isolation because it breaks nock mocks in tests
	if (inTest) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		return new (require(filePath)[className])() as T;
	} else {
		const script = new Script(`new (require('${filePath}').${className})()`);
		return script.runInContext(context) as T;
	}
};