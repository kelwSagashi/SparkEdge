import express, {Application, Request, Response, Router} from "express";
import cors from "cors";
import { Logger } from "./simple-logger";
import { Container, Service } from "@nmg8/di";
import { ControllerRegistry } from "./controller.registry";
import { send } from "./response-helper";
import path from "node:path";

import '@/nodes/node.controller';
import '@/scripts/script.controller';
import '@/workflows/workflow.controller'

@Service()
export class Server {
    private app: Application;

    constructor(
        private readonly logger: Logger
    ) {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());
    }

    public async start(port: number = 3000) {

        // this.setupMiddlewares();
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
            ...([]),
            ...([]),
            ...([]),
            ...([]),
            ...([]),
            ...([]),
            send(handler)
        );

        return router;
    }
}
