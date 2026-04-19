"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCommandDispatcher = setCommandDispatcher;
exports.handleCommand = handleCommand;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
let commandDispatcher = null;
function setCommandDispatcher(fn) {
    commandDispatcher = fn;
}
function getDb() {
    const dbPath = path_1.default.join(os_1.default.homedir(), '.spark_edge', 'db', 'monitor.db');
    return new better_sqlite3_1.default(dbPath);
}
async function handleCommand(raw) {
    let command;
    try {
        command = JSON.parse(raw);
    }
    catch {
        console.error('[Mqtt] Failed to parse command payload — not valid JSON.');
        return;
    }
    if (!command.id || !command.type) {
        console.warn('[Mqtt] Received command without id or type — ignoring.');
        return;
    }
    console.log(`[Mqtt] Received command: type=${command.type} id=${command.id}`);
    const db = getDb();
    try {
        const existing = db
            .prepare('SELECT id FROM mqtt_commands WHERE command_id = ?')
            .get(command.id);
        if (existing) {
            console.log(`[Mqtt] Command ${command.id} already processed — ignoring duplicate.`);
            db.prepare(`UPDATE mqtt_commands SET status = 'ignored' WHERE command_id = ?`).run(command.id);
            return;
        }
        db.prepare(`
      INSERT INTO mqtt_commands (id, command_id, type, payload, status, created_at)
      VALUES (lower(hex(randomblob(16))), ?, ?, ?, 'pending', datetime('now'))
    `).run(command.id, command.type, JSON.stringify(command.payload ?? {}));
    }
    finally {
        db.close();
    }
    if (!commandDispatcher) {
        console.warn('[Mqtt] No command dispatcher registered — command will remain pending.');
        return;
    }
    try {
        await commandDispatcher(command);
    }
    catch (err) {
        console.error(`[Mqtt] Dispatcher failed for command ${command.id}:`, err.message);
        const db2 = getDb();
        try {
            db2.prepare(`
        UPDATE mqtt_commands SET status = 'error', error = ?, finished_at = datetime('now')
        WHERE command_id = ?
      `).run(err.message, command.id);
        }
        finally {
            db2.close();
        }
    }
}
//# sourceMappingURL=mqtt.handlers.js.map