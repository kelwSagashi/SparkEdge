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

    return this.executeInstance(instanceRes.data);
  }

  /**
   * Core execution logic for a single instance run.
   */
  private async executeInstance(instance: InstanceReturningValues): Promise<{ executionId: string; status: string; output?: string; error?: string }> {
    const executionId = nanoid();
    const startedAt = new Date().toISOString();

    // Create execution record
    dbManager.instanceExecutions.create({
      id: executionId,
      instance_id: instance.id,
      status: 'running',
      trigger_type: 'manual',
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

      // 3. Execute the script
      const scriptEntrypoint = path.join(script.local_path ?? '', script.main_file ?? 'main.py');
      const startTime = Date.now();

      const result = await this.venvService.executeScript(
        script.venv_path,
        scriptEntrypoint,
        [], // args could come from trigger_config
        60_000
      );

      const durationMs = Date.now() - startTime;
      const finishedAt = new Date().toISOString();

      if (result.exitCode !== 0) {
        // Script failed
        const errorMessage = result.stderr || `Script exited with code ${result.exitCode}`;
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

      // Load device if available
      let deviceData: Record<string, unknown> | null = null;
      if (instance.device_id && instance.include_device_data) {
         const deviceRes = dbManager.devices.findById(instance.device_id);
         if (!deviceRes.error && deviceRes.data) {
           deviceData = deviceRes.data as unknown as Record<string, unknown>;
         }
      }

      // Enriched context for mapping
      const context: Record<string, unknown> = {
        ...parsedOutput,
        device: deviceData,
        script: {
          id: script.id,
          name: script.name,
          version: script.version
        },
        timestamp: new Date().toISOString()
      };

      // Load destinations
      const destinationsRes = dbManager.instanceDestinations.listByInstance(instance.id);
      if (!destinationsRes.error && destinationsRes.data.length > 0) {
        let sentCount = 0;
        
        for (const dest of destinationsRes.data) {
          if (!dest.enabled) continue;
          
          try {
            await this.sendToDestination(dest, context);
            sentCount++;
          } catch (sendErr: unknown) {
            const msg = sendErr instanceof Error ? sendErr.message : String(sendErr);
            this.logger.log(`[InstanceRunner] Destination ${dest.id} send failed: ${msg}`);
            // Fallback
            if (instance.fallback_enabled) {
               await this.fallbackQueue.enqueue(instance.id, JSON.stringify(parsedOutput));
               fallbackUsed = true;
            }
          }
        }
        
        if (sentCount > 0) destinationSent = true;
      }

      // 5. Record success
      dbManager.instanceExecutions.updateStatus(executionId, 'success', {
        finished_at: finishedAt,
        duration_ms: durationMs,
        output: JSON.stringify(parsedOutput),
        destination_sent: destinationSent,
        fallback_used: fallbackUsed,
      });

      return { executionId, status: 'success', output: result.stdout };

    } catch (error: unknown) {
      const finishedAt = new Date().toISOString();
      const msg = error instanceof Error ? error.message : String(error);
      this.handleExecutionError(instance, executionId, msg, 0, finishedAt);
      return { executionId, status: 'error', error: msg };
    }
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
      this.logger.log(`[InstanceRunner] Instance ${instance.id} error — retry scheduled`);
    } else if (instance.on_error_action === 'stop') {
      dbManager.instances.updateStatus(instance.id, 'error');
      this.logger.log(`[InstanceRunner] Instance ${instance.id} stopped due to error`);
    }
  }

  /**
   * Applies property mappings, templates, custom fields and transformations.
   */
  private applyMapping(
    mappingConfig: Record<string, string>, 
    sourceJson: Record<string, unknown>,
    payloadTemplate?: Record<string, unknown>,
    customFields?: {key: string, value: string}[],
    transformScript?: string
  ): Record<string, unknown> {
      // 1. Start with the template if provided, or empty object
      let payload: Record<string, unknown> = payloadTemplate ? JSON.parse(JSON.stringify(payloadTemplate)) : {};
      
      // 2. Apply property mappings from sourceJson
      if (mappingConfig && Object.keys(mappingConfig).length > 0) {
        for (const [destField, sourcePath] of Object.entries(mappingConfig)) {
           if (!sourcePath) continue;
           
           // Extract via jsonpath if starts with $.
           if (sourcePath.startsWith('$')) {
              try {
                const matches = JSONPath({ path: sourcePath, json: sourceJson }) as unknown[];
                payload[destField] = matches.length > 0 ? matches[0] : null;
              } catch (e) {
                this.logger.log(`[InstanceRunner] JSONPath error for path ${sourcePath}: ${e}`);
                payload[destField] = null;
              }
           } else {
              // Literal value
              payload[destField] = sourcePath;
           }
        }
      } else if (!payloadTemplate) {
        // Fallback: if no mapping and no template, send everything (legacy behavior)
        payload = { ...(sourceJson as Record<string, unknown>) };
      }
      
      // 3. Apply custom fields
      if (customFields && Array.isArray(customFields)) {
        for (const field of customFields) {
          if (field.key) {
            payload[field.key] = field.value;
          }
        }
      }

      // 4. Apply transform script if provided
      if (transformScript && transformScript.trim()) {
        try {
          // Simple sandbox-ish execution
          const transformFn = new Function('payload', 'context', transformScript + '\nreturn payload;');
          payload = transformFn(payload, sourceJson) as Record<string, unknown>;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.log(`[InstanceRunner] Transform script error: ${msg}`);
        }
      }
      
      return payload;
  }

  /**
   * Sends output data to the configured destination endpoint.
   */
  private async sendToDestination(instanceDest: InstanceDestinationReturningValues, sourceJson: Record<string, unknown>): Promise<void> {
    const operationRes = dbManager.resourceOperations.findById(instanceDest.resource_operation_id);
    if (operationRes.error || !operationRes.data) throw new Error('Operation not found');
    const operation = operationRes.data;

    const resourceRes = dbManager.serverResources.findById(operation.resource_id);
    if (resourceRes.error || !resourceRes.data) throw new Error('Resource not found');
    const resource = resourceRes.data;

    const serverRes = dbManager.servers.findById(resource.server_id);
    if (serverRes.error || !serverRes.data) throw new Error('Server not found');
    const server = serverRes.data;
    
    const mappingRes = dbManager.dataMappings.getByInstanceDestination(instanceDest.id);
    const mappingConfig = (mappingRes.data?.mapping as Record<string, string>) ?? {};
    const payloadTemplate = mappingRes.data?.payload_template as Record<string, unknown> || undefined;
    const customFields = (mappingRes.data?.custom_fields as unknown as {key: string, value: string}[]) || undefined;
    const transformScript = mappingRes.data?.transform_script || undefined;
    
    // 1. Apply mapping to get the specialized payload for this destination
    const payloadBody = this.applyMapping(mappingConfig, sourceJson, payloadTemplate, customFields, transformScript);
    
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
