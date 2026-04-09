import express, {Application, Request, Response, Router} from "express";
import cors from "cors";
import jwt from 'jsonwebtoken';
import { Logger } from "./simple-logger";
import { Container, Service } from "@nmg8/di";
import { ControllerRegistry } from "./controller.registry";
import { send } from "./response-helper";
import path from "node:path";
import cookieParser from "cookie-parser";

import '@/devices/device.controller';
import '@/nodes/node.controller';
import '@/scripts/script.controller';
import '@/servers/server.controller';
import '@/users/user.controller';
import '@/workflows/workflow.controller';
import '@/workflows/workflow-executions.controller';
import '@/auth/auth.controller';
import '@/servers/server-types.controller';
import '@/credentials/credentials.controller';


@Service()
export class Server {
    private app: Application;

    constructor(
        private readonly logger: Logger
    ) {
        this.app = express();
        this.app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
        this.app.use(cookieParser() as any);
        this.app.use(express.json());
    }

    setupMiddlewares() {
        // Attach user from JWT cookie if present
        this.app.use(async (req: Request, _res: Response, next) => {
            try {
                const token = (req.cookies as any)?.nmg8_token;
                if (token) {
                    const secret = process.env.JWT_SECRET ?? 'dev-secret';
                    const decoded = jwt.verify(token, secret) as any;
                    // load user record
                    const { dbManager } = await import('nmg8-db');
                    const found = dbManager.users.findById(decoded.id);
                    (req as any).user = found.data ?? null;
                }
            } catch (err) {
                // ignore
            }
            next();
        });

        // Protect specific API routes: require authenticated user
        this.app.use((req: Request, res: Response, next) => {
            const openPrefixes = ['/api/auth', '/api/health', '/api/nodes'];
            if (openPrefixes.some(p => req.path.startsWith(p))) return next();

            const protectedPrefixes = ['/api/workflows', '/api/workflow-executions', '/api/scripts', '/api/devices', '/api/servers', '/api/users', '/api/server-types', '/api/credentials'];
            if (protectedPrefixes.some(p => req.path.startsWith(p)) && !(req as any).user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            next();
        });
    }

    public async start(port: number = 3009) {

        this.setupMiddlewares();
        const nodesIconsPath = path.resolve(__dirname, "../../nodes/dist/nodes")
        this.app.use("/icons", express.static(nodesIconsPath));

        this.setupRoutes();
        
        // console.log(this.app._router);

        // this.app.use((req, res, next) => {
        //     res.json({aaaaaaaaa: 'aaaaaaaaaaaa'});
        // });

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

        const handler = async (req: Request, res: Response) => {
            return await {
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
