import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import { PythonVenvService } from './python-venv.service';
import { FallbackQueueService } from './fallback-queue.service';
import { Logger } from '@/simple-logger';
import type { InstanceReturningValues, InstanceDestinationReturningValues } from 'nmg8-db/src/types';
import { nanoid } from 'nanoid';
import path from 'node:path';
import { JSONPath } from 'jsonpath-plus';
import { DestinationFactory } from './destination-adapters';
import type { IExecutionContext } from './instance.types';

import { TemplateResolver } from './template-resolver';

type ExecutionTriggerType = 'interval' | 'webhook' | 'manual';
type ExecutionStatus = 'running' | 'queued' | 'success' | 'failed' | 'timeout';

/**
 * Orchestrates the execution of an instance:
 * 1. Load the instance config
 * 2. Run the Python script in its venv
 * 3. Send data to destination
 * 4. On failure, enqueue in fallback
 * 5. Record execution history
 */
@Service()
export class InstanceRunnerService {
  constructor(
    private readonly venvService: PythonVenvService,
    private readonly fallbackQueue: FallbackQueueService,
    private readonly logger: Logger,
  ) {}

  /**
   * Manually trigger an instance execution.
   */
  async triggerManual(instanceId: string): Promise<{ executionId: string; status: string; output?: string; error?: string }> {
    const instanceRes = dbManager.instances.findById(instanceId);
    if (instanceRes.error || !instanceRes.data) {
      return { executionId: '', status: 'error', error: 'Instance not found' };
    }

    return this.executeInstance(instanceRes.data, 'manual');
  }

  /**
   * Core execution logic for a single instance run.
   */
  async executeInstance(instance: InstanceReturningValues, triggerType: ExecutionTriggerType = 'manual'): Promise<{ executionId: string; status: string; output?: string; error?: string }> {
    const executionId = nanoid();
    const startedAt = new Date().toISOString();

    // 0. Update instance status to running
    dbManager.instances.updateStatus(instance.id, 'running');

    // 1. Create execution record
    dbManager.instanceExecutions.create({
      id: executionId,
      instance_id: instance.id,
      status: 'running',
      trigger_type: triggerType,
      started_at: startedAt,
      created_at: startedAt,
    });

    try {
      // 1. Find the script
      if (!instance.script_id) {
        throw new Error('Instance has no script assigned');
      }

      const scriptRes = dbManager.downloadedScripts.findById(instance.script_id);
      if (scriptRes.error || !scriptRes.data) {
        throw new Error(`Script ${instance.script_id} not found`);
      }

      const script = scriptRes.data;

      // 2. Ensure venv is ready
      if (!script.venv_ready || !script.venv_path) {
        throw new Error(`Script ${script.id} venv is not ready. Please set up the venv first.`);
      }

      // 2.5 Load device data and resolve parameters
      let deviceData: Record<string, unknown> | null = null;
      if (instance.device_id && instance.include_device_data) {
          const deviceRes = dbManager.devices.findById(instance.device_id);
          if (!deviceRes.error && deviceRes.data) {
            deviceData = deviceRes.data as unknown as Record<string, unknown>;
          }
      }

      const resolverContext = {
        device: deviceData || {},
        timestamp: new Date().toISOString()
      };

      const resolvedParameters = TemplateResolver.resolve(
        (instance.script_parameters as Record<string, any>) || {},
        resolverContext
      );

      // 3. Execute the script
      const scriptEntrypoint = path.join(script.local_path ?? '', script.main_file ?? 'main.py');
      const startTime = Date.now();

      // Passing arguments using the --input flag as expected by nmg8py SDK
      const scriptArgs = ['--input', JSON.stringify(resolvedParameters)];

      const result = await this.venvService.executeScript(
        script.venv_path,
        scriptEntrypoint,
        scriptArgs,
        60_000
      );

      const durationMs = Date.now() - startTime;
      const finishedAt = new Date().toISOString();

      if (result.exitCode !== 0) {
        // Script failed
        const errorMessage = result.stderr || result.stdout || `Script exited with code ${result.exitCode}`;
        this.handleExecutionError(instance, executionId, errorMessage, durationMs, finishedAt);

        return { executionId, status: 'error', error: errorMessage };
      }

      // 4. Try to send data to destinations
      let destinationSent = false;
      let fallbackUsed = false;

      // Ensure the output is an object, try to parse JSON if string
      let parsedOutput: Record<string, unknown> = {};
      try {
        parsedOutput = typeof result.stdout === 'string' ? JSON.parse(result.stdout) : {};
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      // Enriched context for mapping
      const context: IExecutionContext = {
        execution_id: executionId,
        instance_id: instance.id,
        device: deviceData as any,
        instance: instance,
        script: script,
        script_parameters: resolvedParameters as any,
        trigger_type: triggerType,
        timestamp: new Date().toISOString()
      };

      // Load destinations
      const destinationsRes = dbManager.instanceDestinations.listByInstance(instance.id);
      if (!destinationsRes.error && destinationsRes.data.length > 0) {
        let sentCount = 0;
        
        for (const dest of destinationsRes.data) {
          if (!dest.enabled) continue;
          
          try {
            await this.sendToDestination(dest, parsedOutput, context);
            sentCount++;
          } catch (sendErr: unknown) {
            const msg = sendErr instanceof Error ? sendErr.message : String(sendErr);
            if (this.logger) this.logger.log(`[InstanceRunner] Destination ${dest.id} send failed: ${msg}`);
            else console.log(`[InstanceRunner] Destination ${dest.id} send failed: ${msg}`);
            
            // Fallback
            if (instance.fallback_enabled) {
               await this.fallbackQueue.enqueue(instance.id, JSON.stringify(parsedOutput));
               fallbackUsed = true;
            }
          }
        }
        
        destinationSent = sentCount > 0;
      }

      // 5. Record success
      const finalStatus = (destinationSent ? 'success' : 'failed') as ExecutionStatus;
      this.finishExecution(instance, executionId, finalStatus, durationMs, finishedAt, result.stdout, destinationSent, fallbackUsed);

      return { executionId, status: finalStatus, output: result.stdout };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (this.logger) this.logger.log(`[InstanceRunner] Execution ${executionId} failed: ${errorMsg}`);
      else console.log(`[InstanceRunner] Execution ${executionId} failed: ${errorMsg}`);
      
      this.handleExecutionError(instance, executionId, errorMsg, 0, new Date().toISOString());
      
      return { executionId, status: 'error', error: errorMsg };
    } finally {
      // 6. Reset instance status to idle (always)
      dbManager.instances.updateStatus(instance.id, 'idle');
    }
  }

  private finishExecution(
    _instance: InstanceReturningValues,
    executionId: string,
    status: ExecutionStatus,
    durationMs: number,
    finishedAt: string,
    output: string,
    destinationSent: boolean,
    fallbackUsed: boolean
  ): void {
    dbManager.instanceExecutions.updateStatus(executionId, status, {
      finished_at: finishedAt,
      duration_ms: durationMs,
      output: output,
      destination_sent: destinationSent,
      fallback_used: fallbackUsed,
    });
  }

  private handleExecutionError(
    instance: InstanceReturningValues,
    executionId: string,
    errorMessage: string,
    durationMs: number,
    finishedAt: string
  ): void {
    dbManager.instanceExecutions.updateStatus(executionId, 'failed', {
      finished_at: finishedAt,
      duration_ms: durationMs,
      error_message: errorMessage,
    });

    // Handle on_error_action
    if (instance.on_error_action === 'retry') {
      if (this.logger) this.logger.log(`[InstanceRunner] Instance ${instance.id} error — retry scheduled`);
    } else if (instance.on_error_action === 'stop') {
      dbManager.instances.updateStatus(instance.id, 'error');
      if (this.logger) this.logger.log(`[InstanceRunner] Instance ${instance.id} stopped due to error`);
    }
  }

  /**
   * Applies property mappings, templates, custom fields and transformations.
   */
  private applyMapping(
    mappingConfig: Record<string, string>,
    sourceJson: Record<string, unknown>,
    payload_template?: Record<string, unknown>,
    custom_fields?: { key: string; value: string }[],
    transform_script?: string,
    context?: IExecutionContext
  ): Record<string, unknown> {
      // Preparation: Context for template resolution
      const resolveContext = {
        // Root object for JSONPath ($)
        "$": {
          script: sourceJson, // The script execution result (stdout, stderr, etc)
          device: context?.device || {},
          instance: context?.instance || {},
          timestamp: context?.timestamp || new Date().toISOString(),
          execution_id: context?.execution_id
        },
        device: context?.device || {},
        script: context?.script || {}, // The script info/metadata
        instance: context?.instance || {},
        output: sourceJson,
        ...sourceJson, // Support direct access to output fields like {{stdout}} for backward compatibility
        timestamp: context?.timestamp || new Date().toISOString(),
        execution_id: context?.execution_id
      };

      // 1. Initial payload from template (resolved)
      let payload: Record<string, unknown> = payload_template
        ? TemplateResolver.resolve(JSON.parse(JSON.stringify(payload_template)), resolveContext)
        : {};

      // 2. Apply field mapping
      Object.entries(mappingConfig).forEach(([target, source]) => {
        let value;
        if (typeof source === 'string' && source.startsWith('$')) {
          // JSONPath resolution using the full context if it starts with $
          value = this.resolvePath(source, resolveContext as any);
        } else {
          // Template or literal resolution
          value = TemplateResolver.resolve(source, resolveContext);
        }

        if (value !== undefined) {
          payload[target] = value;
        }
      });

      // If no template and no mapping, default to entire source JSON if it exists
      if (
        Object.keys(payload).length === 0 &&
        !payload_template &&
        Object.keys(sourceJson).length > 0
      ) {
        payload = { ...sourceJson };
      }

      // 3. Apply custom fields (also resolved as templates)
      if (custom_fields && Array.isArray(custom_fields)) {
        for (const field of custom_fields) {
          if (field.key && field.value !== undefined) {
            payload[field.key] = TemplateResolver.resolve(field.value, resolveContext);
          }
        }
      }

      // 4. Apply transform script
      if (transform_script && transform_script.trim()) {
        try {
          const transformFn = new Function(
            "payload",
            "context",
            transform_script + "\nreturn payload;",
          );
          payload = transformFn(payload, context ?? resolveContext) as Record<string, unknown>;
        } catch (error: any) {
          if (this.logger) this.logger.log(`[InstanceRunner] Transform script error: ${error.message}`);
          else console.log(`[InstanceRunner] Transform script error: ${error.message}`);
        }
      }
      
      return payload;
  }

  private resolvePath(path: string, json: Record<string, unknown>): any {
    if (path.startsWith('$')) {
      try {
        const matches = JSONPath({ path, json }) as unknown[];
        return matches.length > 0 ? matches[0] : undefined;
      } catch {
        return undefined;
      }
    }
    return path;
  }

  /**
   * Sends output data to the configured destination endpoint.
   */
  private async sendToDestination(
    instanceDest: InstanceDestinationReturningValues,
    sourceJson: Record<string, unknown>,
    context: IExecutionContext,
  ): Promise<void> {
    const operationRes = dbManager.resourceOperations.findById(instanceDest.resource_operation_id);
    if (operationRes.error || !operationRes.data) throw new Error('Operation not found');
    const operation = operationRes.data;

    const resourceRes = dbManager.serverResources.findById(operation.resource_id);
    if (resourceRes.error || !resourceRes.data) throw new Error('Resource not found');
    const resource = resourceRes.data;

    const serverRes = dbManager.servers.findById(resource.server_id);
    if (serverRes.error || !serverRes.data) throw new Error('Server not found');
    const server = serverRes.data;
    
    const mappingRes = dbManager.dataMappings.getByInstanceDestination(
      instanceDest.id,
    );
    const mappingConfig =
      (mappingRes.data?.mapping as Record<string, string>) ?? {};
    const payload_template = mappingRes.data?.payload_template as
      | Record<string, unknown>
      | undefined;
    const custom_fields = (mappingRes.data?.custom_fields as unknown as {
      key: string;
      value: string;
    }[]) || undefined;
    const transform_script = mappingRes.data?.transform_script || undefined;

    // 1. Apply mapping to get the specialized payload for this destination
    const payloadBody = this.applyMapping(
      mappingConfig,
      sourceJson,
      payload_template,
      custom_fields,
      transform_script,
      context,
    );
    
    // 2. Load credentials if available
    let credentials = null;
    if (server.credential_id) {
       const credsRes = dbManager.credentials.findById(server.credential_id);
       if (!credsRes.error && credsRes.data) {
           credentials = credsRes.data;
       }
    }
    
    // 3. Use Factory to get adapter and send
    const adapter = DestinationFactory.create(server, resource, operation, credentials, this.logger);
    await adapter.send(payloadBody);
  }
}

export default InstanceRunnerService;
