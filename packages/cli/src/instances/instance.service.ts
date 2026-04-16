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

interface NormalizedInstancePayload {
  instance: InstanceUpsertValues;
  destinations: {
    destination: Omit<InstanceDestinationUpsertValues, "instance_id">;
    mapping?: Omit<DataMappingUpsertValues, "instance_destination_id">;
  }[];
}

@Service()
export class InstanceService {
  constructor(private readonly tagsService: TagsService) {}

  async listAll(): Promise<ReturningQueries<InstanceReturningValues[]>> {
    return dbManager.instances.listAll();
  }

  async listByProject(
    projectId: string,
  ): Promise<ReturningQueries<InstanceReturningValues[]>> {
    return dbManager.instances.listByProject(projectId);
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
    const normalized = this.normalizePayload(payload);

    // Ensure the ID is preserved in the instance upsert values
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

  private normalizePayload(
    payload: Partial<InstanceRequest.InstancePayload>,
  ): NormalizedInstancePayload {
    const fallbackConfig = payload.fallback_config;
    const errorConfig = payload.error_config;

    return {
      instance: {
        name: payload.name || "",
        description: payload.description,
        project_id: payload.project_id || "",
        script_id: payload.script_id || "",
        device_id: payload.device_id,
        include_device_data: payload.include_device_data,
        trigger_type: payload.trigger_type,
        trigger_config: payload.trigger_config,
        fallback_enabled: fallbackConfig?.enabled,
        fallback_strategy: fallbackConfig?.strategy,
        fallback_retry_interval_seconds: fallbackConfig?.retry_interval_seconds,
        on_error_action: errorConfig?.action || "log_only",
        on_error_config: errorConfig,
        active: payload.active !== undefined ? payload.active : true,
      },
      destinations: (payload.destinations || []).map((dest) => {
        const dataMapping = dest.data_mapping;
        return {
          destination: {
            resource_operation_id: dest.resource_operation_id,
            enabled: dest.enabled !== undefined ? dest.enabled : true,
            priority: dest.priority || 0,
            retry_policy: dest.retry_policy
              ? {
                  max_retries: dest.retry_policy.max_retries,
                  retry_interval: dest.retry_policy.retry_interval,
                }
              : {},
          },
          mapping: dataMapping
            ? {
                mapping: dataMapping.mapping,
                payload_template: dataMapping.payload_template,
                custom_fields: dataMapping.custom_fields,
                transform_script: dataMapping.transform_script,
              }
            : undefined,
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
