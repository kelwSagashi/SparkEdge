import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Queue } from "bullmq";
import DB from "@nmg8/db/src/services/db.service";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// const queue = new Queue("scripts", { connection: { host: "localhost", port: 6379 } });

// Rota de exemplo
app.post("/api/run", async (req, res) => {
    // const job = await queue.add("runScript", req.body);
    res.json({ jobId: "id" });
});

server.listen(3000, () => {
    console.log("🚀 Backend rodando em http://localhost:3000");
});