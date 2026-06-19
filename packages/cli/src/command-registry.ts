import { Container, Service } from 'spark-edge-di'
import { Server } from './server';
import { CommandMetadata } from './commands/command-metadata';

@Service()
export class CommandRegistry {
    private commandName: string;

    constructor(
        // CommandMetadata is injected for future command registration. 
        // DI resolves it even if not used directly in execute().
        private readonly commandMetadata: CommandMetadata,
    ) {
        this.commandName = process.argv[2] ?? 'start';
    }

    async execute() {
        switch (this.commandName) {

            // ─── Cloud Provisioning ───────────────────────────────────────
            case 'pair': {
                const { PairCommand } = await import('./commands/pair.command');
                await new PairCommand().run(process.argv.slice(3));
                break;
            }

            case 'status': {
                const { StatusCommand } = await import('./commands/status.command');
                await new StatusCommand().run();
                break;
            }

            case 'connect': {
                const { ConnectCommand } = await import('./commands/connect.command');
                await new ConnectCommand().run();
                break;
            }

            case 'disconnect': {
                const { DisconnectCommand } = await import('./commands/disconnect.command');
                await new DisconnectCommand().run();
                break;
            }

            case 'remove': {
                const { RemoveCommand } = await import('./commands/remove.command');
                await new RemoveCommand().run();
                break;
            }

            case 'reconnect': {
                const { ReconnectCommand } = await import('./commands/reconnect.command');
                await new ReconnectCommand().run();
                break;
            }

            // ─── Local Provisioning (manual / dev) ──────────────────────
            case 'provision': {
                const { ProvisionCommand } = await import('./commands/provision.command');
                await new ProvisionCommand().run();
                break;
            }

            // ─── Default: start the server ────────────────────────────────
            case 'start':
            default: {
                const server = Container.get(Server);
                await server.start();
                break;
            }
        }
    }
}
