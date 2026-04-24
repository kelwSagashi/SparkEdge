import { dbManager } from 'spark-edge-db';
import { publishResponse } from './mqtt.service';
import { collectSystemStats } from '../system/stats.collector';

/**
 * Handles incoming MQTT command messages.
 * Validates structure, enforces idempotency, persists to DB, and dispatches.
 */

export interface MqttCommand {
  command_id: string; // unique command_id from the remote server
  type: string;       // e.g. "ping", "get_stats", "run_script"
  payload: Record<string, any>;
}

export type CommandHandlerResult = {
  success: boolean;
  result?: any;
  error?: string;
};

export type CommandHandler = (payload: any) => Promise<any>;

// Registry for core commands
const commandHandlers: Record<string, CommandHandler> = {
  "ping": async () => ({ pong: true, timestamp: new Date().toISOString() }),
  "get_stats": async () => collectSystemStats(),
};

/**
 * Register a new command handler.
 */
export function registerHandler(type: string, handler: CommandHandler): void {
  commandHandlers[type] = handler;
  console.log(`[Mqtt] Registered handler for command: ${type}`);
}

// Fallback for CLI-specific commands (run_instance, etc)
let legacyDispatcher: ((command: MqttCommand) => Promise<void>) | null = null;

export function setCommandDispatcher(fn: (command: MqttCommand) => Promise<void>): void {
  legacyDispatcher = fn;
}

export async function handleCommand(raw: string): Promise<void> {
  // 1. Parse JSON
  let command: MqttCommand;
  try {
    command = JSON.parse(raw);
  } catch {
    console.error('[Mqtt] Failed to parse command payload — not valid JSON.');
    return;
  }

  // 2. Validate required fields (using new command_id format)
  const cmdId = command.command_id;
  const type = command.type;

  if (!cmdId || !type) {
    console.warn('[Mqtt] Received command without command_id or type — ignoring.', command);
    return;
  }

  console.log(`[Mqtt] Received command: type=${type} id=${cmdId}`);

  // 3. Idempotency check
  const existing = dbManager.edge.getCommandById(cmdId).data;

  if (existing) {
    console.log(`[Mqtt] Command ${cmdId} already processed — ignoring duplicate.`);
    return;
  }

  // 4. Persist as pending
  dbManager.edge.saveCommand({
    command_id: cmdId,
    type: type,
    payload: command.payload ?? {},
    status: 'pending'
  });

  // 5. Dispatch to registry or legacy dispatcher
  try {
    const handler = commandHandlers[type];
    
    if (handler) {
      dbManager.edge.updateCommandStatus(cmdId, 'running');
      const result = await handler(command.payload ?? {});
      
      dbManager.edge.updateCommandStatus(cmdId, 'done', result);
      await publishResponse(cmdId, 'done', result);
      console.log(`[Mqtt] Command ${type} (${cmdId}) executed successfully.`);
    } else if (legacyDispatcher) {
      // Forward to legacy dispatcher (which handles response/status itself)
      await legacyDispatcher(command);
    } else {
      throw new Error(`Unknown command type: ${type}`);
    }
  } catch (err: any) {
    console.error(`[Mqtt] Failed to execute command ${cmdId}:`, err.message);
    dbManager.edge.updateCommandStatus(cmdId, 'error', null, err.message);
    await publishResponse(cmdId, 'error', null, err.message);
  }
}

