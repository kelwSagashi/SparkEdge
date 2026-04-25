import express, {Application, Request, Response, Router} from "express";
import cors from "cors";
import jwt from 'jsonwebtoken';
import { Logger } from "./simple-logger";
import { Container, Service } from "@spark-edge/di";
import { ControllerRegistry } from "./controller.registry";
import { send } from "./response-helper";
import path from "node:path";
import cookieParser from "cookie-parser";

import '@/devices/device.controller';
import '@/scripts/script.controller';
import '@/servers/server.controller';
import '@/users/user.controller';
import '@/auth/auth.controller';
import '@/servers/server-types.controller';
import '@/credentials/credentials.controller';
import '@/instances/instance.controller';
import '@/tags/tags.controller';
import '@/executions/executions.controller';
import '@/fallback/fallback.controller';
import '@/projects/projects.controller';
import '@/webhook/webhook.controller';
import '@/instances/adapters.controller';
import '@/integrations/mqtt/cli.controller';
import '@/integrations/spark-cloud/spark-cloud.controller';

import { ServerTypeRegistry } from './instances/server-types';
import { AdapterRegistry } from './instances/destination-adapters';
import './instances/adapters';
import './instances/server-types';
import './instances/destination-adapters';
import { InstanceSchedulerService } from './instances/instance-scheduler.service';

// ─── MQTT (optional) ─────────────────────────────────────────────────────────
// Loaded lazily so a missing broker never blocks the server from starting.
// ─── Spark Edge Lifecycle ────────────────────────────────────────────────────
async function bootstrapSparkEdge(): Promise<void> {
  const { lifecycleService } = await import('spark-edge-core');
  
  // 1. Register CLI integration command handlers (local to CLI package)
  const { registerMqttCommandHandlers } = await import('./integrations/mqtt/mqtt.commands');
  registerMqttCommandHandlers();

  // 2. Run core boot sequence (auto-connect if provisioned)
  await lifecycleService.boot();
}

@Service()
export class Server {
    private app: Application;

    constructor(
        private readonly logger: Logger
    ) {
        this.app = express();
        this.app.use(
          cors({ origin: [/^http:\/\/localhost:5\d{3}$/], credentials: true }),
        );
        this.app.use(cookieParser() as any);
        this.app.use(express.json());
    }

    setupMiddlewares() {
        // Authenticate request
        this.app.use(async (req: Request, _res: Response, next) => {
            try {
                const { dbManager } = await import('spark-edge-db');
                const secret = process.env.JWT_SECRET ?? 'dev-secret';

                // Helper to verify JWT and find user
                const verifyUserByToken = (token: string) => {
                    try {
                        const decoded = jwt.verify(token, secret) as any;
                        const found = dbManager.users.findById(decoded.id);
                        return found.data;
                    } catch {
                        return null;
                    }
                };

                // 1. Try JWT from Cookie
                const cookieToken = (req.cookies as any)?.spark_edge_token;
                if (cookieToken) {
                    const user = verifyUserByToken(cookieToken);
                    if (user) {
                        (req as any).user = user;
                        return next();
                    }
                }

                // 2. Try JWT from Authorization Header
                const authHeader = req.headers.authorization;
                if (authHeader?.startsWith('Bearer ')) {
                    const headerToken = authHeader.substring(7);
                    const user = verifyUserByToken(headerToken);
                    if (user) {
                        (req as any).user = user;
                        return next();
                    }
                }

                // 3. Try API Key from Header
                const apiKey = req.headers['x-api-key'] as string;
                if (apiKey) {
                    const found = dbManager.users.findByApiKey(apiKey);
                    if (found.data) {
                        (req as any).user = found.data;
                        return next();
                    }
                }
            } catch (err) {
                // Unexpected error during auth process
            }
            next();
        });

        // Protect specific API routes
        this.app.use((req: Request, res: Response, next) => {
            const openPrefixes = ['/api/auth', '/api/health', '/api/nodes', '/api/webhook'];
            if (openPrefixes.some(p => req.path.startsWith(p))) return next();

            const protectedPrefixes = [
                '/api/instances', 
                '/api/scripts', 
                '/api/devices', 
                '/api/servers', 
                '/api/users', 
                '/api/server-types', 
                '/api/credentials', 
                '/api/tags', 
                '/api/executions', 
                '/api/fallback', 
                '/api/projects'
            ];

            if (protectedPrefixes.some(p => req.path.startsWith(p)) && !(req as any).user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            next();
        });
    }

    public async start(port: number = 3009) {
        await ServerTypeRegistry.syncWithDatabase();
        await AdapterRegistry.syncWithDatabase();

        this.setupMiddlewares();
        
        const nodesIconsPath = path.resolve(__dirname, "../../nodes/dist/nodes")
        this.app.use("/icons", express.static(nodesIconsPath));

        // Serve Frontend Build
        const frontendPath = path.resolve(__dirname, "../../frontend/dist");
        this.app.use(express.static(frontendPath));

        this.setupRoutes();

        // Support for SPA routing in production: redirect all non-API/non-static requests to index.html
        this.app.get("*", (req, res, next) => {
            if (req.path.startsWith("/api") || req.path.startsWith("/icons") || req.path.includes(".")) {
                return next();
            }
            res.sendFile(path.join(frontendPath, "index.html"), (err) => {
                if (err) {
                    // index.html not found, continue to next middleware (which will be 404)
                    next();
                }
            });
        });

        // Start the instance execution scheduler
        Container.get(InstanceSchedulerService).start();

        // Start Spark Edge lifecycle (non-blocking)
        bootstrapSparkEdge().catch((err: any) =>
          this.logger.log(`[Lifecycle] Startup warning: ${err.message}`)
        );

        this.app.listen(port, () => {
            this.logger.log(`🚀 Servidor rodando em http://localhost:${port}`);
        });
    }

    setupRoutes() {

        const this_router = this.activate();

        this.app.use('/api', this_router);

        const routers = Container.get(ControllerRegistry).activate();

        for (const router of routers) {
            this.app.use(router.basePath, router.router);
        }
    }

    activate(): ReturnType<typeof Router> {
        const router = Router();

        const handler = async (_req: Request) => {
            return {
                status: 'OK',
                id: '',
                app: ''
            }
        }

        router['get'](
            '/health', 
            send(handler)
        );

        return router;
    }
}

