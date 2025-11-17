import { LoadNodes } from "@/load-nodes";
import { Container, Get, Post, RestController } from "@nmg8/di";
import { Request, Response } from "express";
import { Expression, NodeExecutionContext } from "nmg8-core";
import { INode } from "nmg8-workflow";
import { NodeRequest } from "./node.request";

@RestController('/nodes')
export class NodeControler {
    constructor(
        private readonly loadNodes: LoadNodes
    ) {}
    
    // const server = http.createServer(this.app);
        // const io = new Server(server, { cors: { origin: "*" } });

        // const queue = new Queue("scripts", { connection: { host: "localhost", port: 6379 } });

        @Get('/')
        async getNodes(_req: Request, _res: Response) {
            return this.loadNodes.getLoadedNames();
        }
        
        @Post('/run/test')
        async runTest(
            req: Request<{}, {}, { node: INode }>,
            _res: Response
        ){
            return new Promise((resolve, reject) => {
                try {
                    const loadedNode = this.loadNodes.getNode(req.body.node.data.name);
                    const type = loadedNode.type;
                    
                    resolve({
                        properties: type.getProperties()
                    });

                } catch (error) {
                    reject(error);
                }
            });
        }

        // Serve arquivos SVG com rota /icons/<arquivo>
        // this.app.use("/icons", express.static(nodesIconsPath));

        @Get("/:name/description")
        async getNodeDescripton(req: Request, res: Response) {
            const type = req.params.name;

            const Node = Container.get(LoadNodes).getNode(type);

            if (!Node?.type) {
                return {
                    message: "not found!"
                };
            }

            return Node.type.getProperties()
        }
        
        @Post("/invoke/:name/:method")
        async invokeNode(req: NodeRequest.InvokeNodeClass, _res: Response) {
            const name = req.params.name;
            const method = req.params.method;
            const node = req.body.node;
            
            const LoadedNode = Container.get(LoadNodes).getNode(name);

            if (!LoadedNode?.type) {
                return {
                    message: "not found!"
                };
            }

            console.log('invoke node', node);

            const context = new NodeExecutionContext(node, LoadedNode.type);

            const response = await context.callNodeMethod(method);

            return response;
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