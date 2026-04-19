import { dbManager } from 'spark-edge-db';

/**
 * Handles incoming MQTT command messages.
 * Validates structure, enforces idempotency, persists to DB, and dispatches.
 */

export interface MqttCommand {
  id: string;    // unique command_id from the remote server
  type: string;  // e.g. "run_instance", "update_config"
  payload: Record<string, any>;
}

// Will be set by the CLI integration layer to dispatch commands
let commandDispatcher: ((command: MqttCommand) => Promise<void>) | null = null;

export function setCommandDispatcher(fn: (command: MqttCommand) => Promise<void>): void {
  commandDispatcher = fn;
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

  // 2. Validate required fields
  if (!command.id || !command.type) {
    console.warn('[Mqtt] Received command without id or type — ignoring.');
    return;
  }

  console.log(`[Mqtt] Received command: type=${command.type} id=${command.id}`);

  // 3. Idempotency check
  const existing = dbManager.edge.getCommandById(command.id).data;

  if (existing) {
    console.log(`[Mqtt] Command ${command.id} already processed — ignoring duplicate.`);
    dbManager.edge.updateCommandStatus(command.id, 'ignored');
    return;
  }

  // 4. Persist as pending
  dbManager.edge.saveCommand({
    command_id: command.id,
    type: command.type,
    payload: command.payload ?? {},
    status: 'pending'
  });

  // 5. Dispatch to registered handler
  if (!commandDispatcher) {
    console.warn('[Mqtt] No command dispatcher registered — command will remain pending.');
    return;
  }

  try {
    await commandDispatcher(command);
    dbManager.edge.updateCommandStatus(command.id, 'done');
  } catch (err: any) {
    console.error(`[Mqtt] Dispatcher failed for command ${command.id}:`, err.message);
    dbManager.edge.updateCommandStatus(command.id, 'error', err.message);
  }
}
