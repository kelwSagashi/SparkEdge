import { LoadNodes } from "@/load-nodes";
import { Logger } from "@/simple-logger";
import { Container, Get, Post, RestController } from "@nmg8/di";
import { Request, Response } from "express";
import { Expression } from "nmg8-core";
import path from "node:path";

@RestController('/nodes')
export class NodeControler {
    constructor(
        private readonly logger: Logger,
    ) {

    }
    
    // const server = http.createServer(this.app);
        // const io = new Server(server, { cors: { origin: "*" } });

        // const queue = new Queue("scripts", { connection: { host: "localhost", port: 6379 } });

        // Rota de exemplo
        @Get('/run')
        async run(req: Request, res: Response){
            // const job = await queue.add("runScript", req.body);
            return new Promise((resolve, reject) => {
                resolve({
                    jobId: 'id'
                })
            });
        }

        // Serve arquivos SVG com rota /icons/<arquivo>
        // this.app.use("/icons", express.static(nodesIconsPath));

        @Get("/:type/description")
        async getNodeDescripton(req: Request, res: Response) {
            const type = req.params.type;

            const Node = Container.get(LoadNodes).getNode(type);

            if (!Node?.type) {
                return {
                    message: "not found!"
                };
            }

            return Node.type.getProperties()
        }

        @Post("/expression/resolve")
        async resolveExpression(req: Request, res: Response) {
            const { expression, context } = req.body;
            const ev = new Expression();
            return ev.evaluateExpression(
                expression, context)
        }

        @Post("/workflow/execute/:id")
        async workflowExecute(req: Request, res: Response) {
            
        }

        @Post("/workflow/execute/test/")
        async workflowExecuteTest(req: Request, res: Response) {
            const {node} = req.body;
        }
}