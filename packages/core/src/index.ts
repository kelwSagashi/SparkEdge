import express from "express";
import http from "http";
import cors from "cors";
import { Expression } from "./expression";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// const queue = new Queue("scripts", { connection: { host: "localhost", port: 6379 } });

// Rota de exemplo
app.post("/api/run", async (req, res) => {
    // const job = await queue.add("runScript", req.body);
    res.json({ jobId: "id" });
});

app.get("/api/nodes/:type/description", async (req, res) => {
    const type = req.params.type;

    // const NodeClass = NodeRegistry.get(type);

    // if (!NodeClass) {
    //     res.status(404).json({
    //         message: "not found!"
    //     });
    //     return;
    // }

    // const nodeInstance = new NodeClass();

    // res.json(nodeInstance.getProperties());
    return;
})

app.post("/api/expression/resolve", async (req, res) => {
    const { expression, context } = req.body;
    const ev = new Expression()
    res.json(ev.evaluateExpression(
        expression, context))
    return;
});

app.post("/api/workflow/execute/:id", async (req, res) => {
    
})

app.post("/api/workflow/execute/test/", async (req, res) => {
    const {node} = req.body;
    
})

server.listen(3000, () => {
    console.log("🚀 Backend rodando em http://localhost:3000");
});