import fg from "fast-glob";
import { DirectoryLoader } from "./directory-loader";

export class DefaultNodeLoader extends DirectoryLoader {
    packageName = "base";
    
    async loadAll() {
        const nodes = await fg.glob('**/*.node.js', {
			cwd: this.directory,
			absolute: true,
		});

        for (const nodePath of nodes) {
            try {
                await this.loadNodeFromFile(nodePath);
            } catch (error) {
                continue;
            }
		}
        
    }

}