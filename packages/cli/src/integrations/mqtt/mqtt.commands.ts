import { dbManager } from 'spark-edge-db';
import { mqttHandlers, mqttService } from 'spark-edge-core';
import type { MqttCommand } from 'spark-edge-core';

const { setCommandDispatcher } = mqttHandlers;
const { publishResponse, publishLog } = mqttService;

/**
 * Bridge between MQTT command system and the Sparkit script executor.
 * Registers a dispatcher that handles remote commands for running instances.
 * Uses centralized @spark-edge/db for persistence.
 */

function markCommandStatus(
  commandId: string,
  status: 'running' | 'done' | 'error',
  result?: Record<string, any> | null,
  error?: string
): void {
  dbManager.edge.updateCommandStatus(commandId, status, result, error);
}

/**
 * Register the command dispatcher with a lazy-loaded InstanceRunnerService.
 * This avoids circular dependency issues.
 */
export function registerMqttCommandHandlers(): void {
  setCommandDispatcher(async (command: MqttCommand) => {
    console.log(`[Mqtt] Dispatching command: ${command.type} (${command.id})`);

    switch (command.type) {
      case 'run_instance': {
        const instanceId: string = command.payload?.instance_id;
        if (!instanceId) {
          await publishResponse(command.id, 'error', null, 'Missing instance_id in payload');
          markCommandStatus(command.id, 'error', null, 'Missing instance_id');
          return;
        }

        markCommandStatus(command.id, 'running');
        await publishLog(`Command started: run_instance for ${instanceId}`);

        try {
          // Lazy-load to avoid circular deps at module init time
          const { Container } = await import('@spark-edge/di');
          const { InstanceRunnerService } = await import('../../instances/instance-runner.service');
          const runner = Container.get(InstanceRunnerService);
          const result = await runner.triggerManual(instanceId);

          if (result.status === 'success' || result.status === 'running') {
            markCommandStatus(command.id, 'done', { execution_id: result.executionId });
            await publishResponse(command.id, 'done', { execution_id: result.executionId });
          } else {
            markCommandStatus(command.id, 'error', null, result.error);
            await publishResponse(command.id, 'error', null, result.error);
          }
        } catch (err: any) {
          markCommandStatus(command.id, 'error', null, err.message);
          await publishResponse(command.id, 'error', null, err.message);
        }
        break;
      }

      default:
        console.warn(`[Mqtt] Unknown command type: ${command.type}`);
        markCommandStatus(command.id, 'error', null, `Unknown command type: ${command.type}`);
        await publishResponse(command.id, 'error', null, `Unknown command type: ${command.type}`);
    }
  });

  console.log('[Mqtt] Command handlers registered');
}
