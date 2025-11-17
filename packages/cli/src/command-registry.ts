import {Container, Service} from '@nmg8/di'
import { Server } from './server';
import { CommandMetadata } from './commands/command-metadata';

import '@/server'
import { NodeRegistry } from './node-registry';
import '@/load-nodes'

@Service()
export class CommandRegistry {
    private commandName: string;

    constructor(
        private readonly commandMetadata: CommandMetadata,
        private readonly nodeRegistry: NodeRegistry
    ) {
        this.commandName = process.argv[2] ?? 'start';
    }

    async execute() {
        await this.nodeRegistry.init();
        const server = Container.get(Server);

        await server.start();
    }
}