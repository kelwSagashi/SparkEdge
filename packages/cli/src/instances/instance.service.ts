import { Service } from "@nmg8/di";
import { dbManager } from "nmg8-db";
import { TagsService } from "../tags/tags.service";
import type {
  ReturningQueries,
  InstanceUpsertValues,
  InstanceReturningValues,
  InstanceDestinationUpsertValues,
  DataMappingUpsertValues,
} from "nmg8-db/src/types";

import { InstanceRequest } from "./instance.request";
import type { 
  IDataMapping, 
} from "./instance.types";

interface NormalizedInstancePayload {
  instance: InstanceUpsertValues;
  destinations: {
    destination: Omit<InstanceDestinationUpsertValues, "instance_id">;
    mapping?: Omit<DataMappingUpsertValues, "instance_destination_id"> | IDataMapping;
  }[];
}

@Service()
export class InstanceService {
  constructor(private readonly tagsService: TagsService) {}

  async listAll(): Promise<ReturningQueries<InstanceReturningValues[]>> {
    return dbManager.instances.listAll();
  }

  async listByProject(
    project_id: string,
  ): Promise<ReturningQueries<InstanceReturningValues[]>> {
    return dbManager.instances.listByProject(project_id);
  }

  async listActive(): Promise<ReturningQueries<InstanceReturningValues[]>> {
    return dbManager.instances.listActive();
  }

  async findById(
    id: string,
  ): Promise<ReturningQueries<InstanceReturningValues | null>> {
    return dbManager.instances.findById(id);
  }

  async create(payload: InstanceRequest.InstancePayload) {
    const normalized = this.normalizePayload(payload);

    let tagIds: string[] | undefined;
    if (payload.tags && Array.isArray(payload.tags)) {
      tagIds = await this.tagsService.findOrCreateByNames(
        payload.tags,
        normalized.instance.project_id || undefined,
      );
    }

    return dbManager.registerInstance({
      ...normalized,
      tagIds,
    });
  }

  async update(id: string, payload: Partial<InstanceRequest.InstancePayload>) {
    // If we have destinations, it's a full config update (e.g. from Edit screen)
    if (payload.destinations && Array.isArray(payload.destinations)) {
      const normalized = this.normalizePayload(payload);
      normalized.instance.id = id;

      let tagIds: string[] | undefined;
      if (payload.tags && Array.isArray(payload.tags)) {
        tagIds = await this.tagsService.findOrCreateByNames(
          payload.tags,
          normalized.instance.project_id || undefined,
        );
      }

      return dbManager.registerInstance({
        ...normalized,
        tagIds,
      });
    }

    // Otherwise, it's a partial update (e.g. Pause/Resume)
    // We map only the fields that are actually provided in the payload
    const updateData: Partial<InstanceUpsertValues> = {};
    
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.active !== undefined) updateData.active = payload.active;
    if (payload.status !== undefined) updateData.status = payload.status as any;
    if (payload.trigger_type !== undefined || payload.triggerType !== undefined) 
        updateData.trigger_type = payload.trigger_type ?? payload.triggerType;
    if (payload.trigger_config !== undefined || payload.triggerConfig !== undefined)
        updateData.trigger_config = payload.trigger_config ?? payload.triggerConfig;
    if (payload.include_device_data !== undefined || payload.includeDeviceData !== undefined)
        updateData.include_device_data = payload.include_device_data ?? payload.includeDeviceData;
    if (payload.device_id !== undefined || payload.deviceId !== undefined)
        updateData.device_id = payload.device_id ?? payload.deviceId;
    if (payload.script_id !== undefined || payload.scriptId !== undefined)
        updateData.script_id = payload.script_id ?? payload.scriptId;
    if (payload.project_id !== undefined || payload.projectId !== undefined)
        updateData.project_id = payload.project_id ?? payload.projectId;

    // Handle nested configs if provided
    const fc = payload.fallback_config || payload.fallbackConfig;
    if (fc) {
        if (fc.enabled !== undefined) updateData.fallback_enabled = fc.enabled;
        if (fc.strategy !== undefined) updateData.fallback_strategy = fc.strategy as any;
        if (fc.retry_interval_seconds !== undefined || (fc as any).retryIntervalSeconds !== undefined)
            updateData.fallback_retry_interval_seconds = fc.retry_interval_seconds ?? (fc as any).retryIntervalSeconds;
    }

    const ec = payload.error_config || payload.errorConfig;
    if (ec) {
        if (ec.action !== undefined) updateData.on_error_action = ec.action as any;
        if (ec.notify_url !== undefined || (ec as any).notifyUrl !== undefined)
            updateData.on_error_config = { 
                ...((updateData.on_error_config as any) || {}), 
                notify_url: ec.notify_url ?? (ec as any).notifyUrl 
            };
    }

    // Special case for script parameters if provided as object or array
    if (payload.script_inputs || payload.scriptInputs) {
        updateData.script_parameters = payload.script_inputs || payload.scriptInputs;
    }

    return dbManager.instances.update(id, updateData);
  }

  private normalizePayload(
    payload: InstanceRequest.InstancePayload | Partial<InstanceRequest.InstancePayload>,
  ): NormalizedInstancePayload {
    // 1. Map top-level instance fields
    const instanceData: Partial<InstanceUpsertValues> = {
      name: payload.name,
      description: payload.description,
      project_id: payload.project_id || payload.projectId,
      script_id: payload.script_id || payload.scriptId,
      device_id: payload.device_id || payload.deviceId,
      include_device_data: payload.include_device_data ?? payload.includeDeviceData ?? false,
      status: payload.status as any,
      active: payload.active,
      trigger_type: payload.trigger_type ?? payload.triggerType ?? "interval",
    };

    // 2. Resolve script parameters (Dictionary logic)
    // We merge script_inputs (object from JSON editor) and script_parameters (array from forms)
    const finalParams: Record<string, any> = {
      ...(payload.script_inputs || payload.scriptInputs || {}),
    };

    const rawParams = payload.script_parameters || payload.scriptParameters;
    if (Array.isArray(rawParams)) {
      rawParams.forEach((p: any) => {
        if (p && typeof p === "object" && "key" in p) {
          finalParams[p.key] = p.value;
        }
      });
    }

    // 3. Trigger configuration
    const trigger_config = payload.trigger_config || payload.triggerConfig || {};
    
    // 4. Fallback and Error mapping
    const fallback_enabled = payload.fallback_config?.enabled ?? payload.fallbackConfig?.enabled ?? false;
    const fallback_strategy = payload.fallback_config?.strategy ?? payload.fallbackConfig?.strategy ?? "background_job";
    const fallback_retry_interval_seconds = payload.fallback_config?.retry_interval_seconds ?? payload.fallbackConfig?.retryIntervalSeconds ?? 300;
    
    const on_error_action = payload.error_config?.action ?? payload.errorConfig?.action ?? "log_only";
    const on_error_config = payload.error_config || payload.errorConfig || { action: "log_only" };

    return {
      instance: {
        ...instanceData,
        script_parameters: finalParams,
        trigger_config: trigger_config,
        fallback_enabled,
        fallback_strategy,
        fallback_retry_interval_seconds,
        on_error_action,
        on_error_config,
      } as InstanceUpsertValues,
      destinations: (payload.destinations || []).map((dest) => {
        const dataMapping = dest.data_mapping || dest.dataMapping;
        
        return {
          destination: {
            resource_operation_id: dest.resource_operation_id || dest.resourceOperationId || "",
            enabled: dest.enabled !== undefined ? dest.enabled : true,
            priority: dest.priority || 0,
            retry_policy: {
              max_retries: dest.retry_policy?.max_retries ?? dest.retryPolicy?.maxRetries ?? 3,
              retry_interval: dest.retry_policy?.retry_interval ?? dest.retryPolicy?.retryInterval ?? 60,
            },
          },
          mapping: dataMapping
            ? {
                mapping: dataMapping.mapping || {},
                payload_template: dataMapping.payload_template || dataMapping.payloadTemplate || {},
                custom_fields: dataMapping.custom_fields || dataMapping.customFields || [],
                transform_script: dataMapping.transform_script || dataMapping.transformScript,
              }
            : { mapping: {} },
        };
      }),
    };
  }

  async upsert(
    values: InstanceUpsertValues,
  ): Promise<ReturningQueries<InstanceReturningValues | null>> {
    return dbManager.instances.upsert(values);
  }

  async updateStatus(
    id: string,
    status: InstanceReturningValues["status"],
  ): Promise<ReturningQueries<InstanceReturningValues | null>> {
    return dbManager.instances.updateStatus(id, status);
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    return dbManager.instances.delete(id);
  }

  // Helper to get an instance alongside its destinations and mappings
  async getWithDestinations(id: string) {
    const instance = await this.findById(id);
    if (!instance.data) return { data: null, error: instance.error };

    const destinations =
      await dbManager.instanceDestinations.listByInstance(id);
    if (destinations.error)
      return { data: instance.data, error: destinations.error };

    const formattedDestinations = [];
    for (const dest of destinations.data) {
      const mapping = await dbManager.dataMappings.getByInstanceDestination(
        dest.id,
      );
      formattedDestinations.push({
        destination: dest,
        mapping: mapping.data,
      });
    }

    return {
      data: {
        instance: instance.data,
        destinations: formattedDestinations,
      },
    };
  }
}

export default InstanceService;
