import express, {Application} from "express";
import http from "http";
import cors from "cors";
import { Logger } from "./simple-logger";
import { Container, Service } from "@nmg8/di";
import { Expression } from "nmg8-core";
import { LoadNodes } from "./load-nodes";
// import { Expression } from "";

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
        this.setupRoutes();

        this.app.listen(port, () => {
        this.logger.log(`🚀 Servidor rodando em http://localhost:${port}`);
        });
    }

    setupRoutes() {
        // const server = http.createServer(this.app);
        // const io = new Server(server, { cors: { origin: "*" } });

        // const queue = new Queue("scripts", { connection: { host: "localhost", port: 6379 } });

        // Rota de exemplo
        this.app.post("/api/run", async (req, res) => {
            // const job = await queue.add("runScript", req.body);
            res.json({ jobId: "id" });
        });

        this.app.get("/api/nodes/:type/description", async (req, res) => {
            const type = req.params.type;

            const Node = Container.get(LoadNodes).getNode(type);

            if (!Node?.type) {
                res.status(404).json({
                    message: "not found!"
                });
                return;
            }

            res.json(Node.type.getProperties());
            return;
        })

        this.app.post("/api/expression/resolve", async (req, res) => {
            const { expression, context } = req.body;
            const ev = new Expression();
            res.json(ev.evaluateExpression(
                expression, context))
            return;
        });

        this.app.post("/api/workflow/execute/:id", async (req, res) => {
            
        })

        this.app.post("/api/workflow/execute/test/", async (req, res) => {
            const {node} = req.body;
            
        })
    }
}
