import { dbManager } from 'spark-edge-db';
import { mqttHandlers, mqttService } from 'spark-edge-core';
import { exec } from 'child_process';

const { registerHandler } = mqttHandlers;
const { publishLog } = mqttService;

/**
 * Registers CLI-specific command handlers.
 * Extends the core registry with handlers that require CLI context (reboot, script execution).
 */
export function registerMqttCommandHandlers(): void {
  
  // 1. RESTART (System Reboot)
  registerHandler('restart', async () => {
    await publishLog('Edge rebooting via remote command...', 'warn');
    
    // Slight delay to allow MQTT response to be sent
    setTimeout(() => {
      const cmd = process.platform === 'win32' ? 'shutdown /r /t 5' : 'sudo reboot';
      exec(cmd, (err) => {
        if (err) console.error('[Mqtt] Failed to execute reboot:', err);
      });
    }, 2000);

    return { message: 'Reboot initiated (System will restart in 5 seconds)' };
  });

  // 2. RUN_SCRIPT (Bridge to InstanceRunner)
  registerHandler('run_script', async (payload: any) => {
    const instanceId = payload.script_name || payload.instance_id;
    
    if (!instanceId) {
      throw new Error('Missing script_name (instance_id) in payload');
    }

    await publishLog(`Executing script: ${instanceId}`, 'info');

    try {
      const { Container } = await import('@spark-edge/di');
      const { InstanceRunnerService } = await import('../../instances/instance-runner.service');
      const runner = Container.get(InstanceRunnerService);
      const result = await runner.triggerManual(instanceId);

      if (result.status === 'error') {
        throw new Error(result.error || 'Unknown error during script execution');
      }

      return { 
        execution_id: result.executionId,
        status: result.status,
        message: 'Script triggered successfully'
      };
    } catch (err: any) {
      throw new Error(`Script execution failed: ${err.message}`);
    }
  });

  // 3. CONFIG (Update local config)
  registerHandler('CONFIG', async (payload: any) => {
    const config = payload.data || payload;
    if (!config) throw new Error('Missing configuration data');

    dbManager.edge.upsertEdgeConfig(config);
    await publishLog('Local configuration updated via MQTT', 'info');
    
    return { message: 'Configuration synchronized' };
  });

  // 4. Legacy REBOOT / UPDATE for compatibility
  registerHandler('REBOOT', async () => {
    // Just alias to restart logic
    const restartHandler = (mqttHandlers as any).commandHandlers?.['restart'];
    if (restartHandler) return restartHandler({});
    return { message: 'Reboot triggered (alias)' };
  });

  console.log('[Mqtt] CLI Command handlers registered');
}

