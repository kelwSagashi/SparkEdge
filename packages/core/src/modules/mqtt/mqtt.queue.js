"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueue = enqueue;
exports.retryAll = retryAll;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const mqtt_publisher_1 = require("./mqtt.publisher");
function getDb() {
    const dbPath = path_1.default.join(os_1.default.homedir(), '.spark_edge', 'db', 'monitor.db');
    return new better_sqlite3_1.default(dbPath);
}
async function enqueue(topic, payload) {
    const db = getDb();
    try {
        db.prepare(`
      INSERT INTO mqtt_queue (id, topic, payload, attempts, created_at)
      VALUES (lower(hex(randomblob(16))), ?, ?, 0, datetime('now'))
    `).run(topic, payload);
    }
    finally {
        db.close();
    }
}
const MAX_ATTEMPTS = 10;
async function retryAll() {
    const db = getDb();
    let rows = [];
    try {
        rows = db.prepare(`SELECT * FROM mqtt_queue WHERE attempts < ? ORDER BY created_at ASC`).all(MAX_ATTEMPTS);
    }
    finally {
        db.close();
    }
    if (rows.length === 0)
        return;
    console.log(`[Mqtt] Retrying ${rows.length} queued message(s)...`);
    for (const row of rows) {
        try {
            await (0, mqtt_publisher_1.publish)(row.topic, row.payload);
            const db2 = getDb();
            try {
                db2.prepare('DELETE FROM mqtt_queue WHERE id = ?').run(row.id);
            }
            finally {
                db2.close();
            }
        }
        catch {
            const db2 = getDb();
            try {
                db2.prepare(`UPDATE mqtt_queue SET attempts = attempts + 1, last_attempt_at = datetime('now') WHERE id = ?`).run(row.id);
            }
            finally {
                db2.close();
            }
            if (row.attempts + 1 >= MAX_ATTEMPTS) {
                console.warn(`[Mqtt] Dropping message to ${row.topic} after ${MAX_ATTEMPTS} failed attempts.`);
                const db3 = getDb();
                try {
                    db3.prepare('DELETE FROM mqtt_queue WHERE id = ?').run(row.id);
                }
                finally {
                    db3.close();
                }
            }
        }
    }
}
//# sourceMappingURL=mqtt.queue.js.map