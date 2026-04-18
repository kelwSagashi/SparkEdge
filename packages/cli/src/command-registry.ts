import { Container, Service } from '@spark-edge/di'
import { Server } from './server';
import { CommandMetadata } from './commands/command-metadata';

@Service()
export class CommandRegistry {
    private commandName: string;

    constructor(
        private readonly commandMetadata: CommandMetadata,
    ) {
        this.commandName = process.argv[2] ?? 'start';
    }

    async execute() {
        const server = Container.get(Server);
        await server.start();
    }
}
