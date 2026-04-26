/**
 * Enhanced Instance Service
 * Complete service for instance management with business logic
 * Uses existing InstanceService from instance.service.ts
 */

import { Service } from "@spark-edge/di";
import { dbManager } from "spark-edge-db";
import { DataMappingService } from "./data-mapping.service";
import type {
  ReturningQueries,
  InstanceReturningValues,
} from "spark-edge-db";

@Service()
export class InstanceServiceEnhanced {
  constructor(private readonly dataMappingService: DataMappingService) {}

  // ─── Basic CRUD ────────────────────────────────────────────────────────────

  async listAll(): Promise<ReturningQueries<InstanceReturningValues[]>> {
    try {
      const result = await dbManager.instances.listAll();
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to list instances";
      return { data: [], error: msg };
    }
  }

  async listByProject(
    project_id: string,
  ): Promise<ReturningQueries<InstanceReturningValues[]>> {
    try {
      const result = await dbManager.instances.listByProject(project_id);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to list instances";
      return { data: [], error: msg };
    }
  }

  async listActive(): Promise<ReturningQueries<InstanceReturningValues[]>> {
    try {
      const result = await dbManager.instances.listActive();
      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to list active instances";
      return { data: [], error: msg };
    }
  }

  async findById(
    id: string,
  ): Promise<ReturningQueries<InstanceReturningValues | null>> {
    try {
      const result = await dbManager.instances.findById(id);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to find instance";
      return { data: null, error: msg };
    }
  }

  async delete(id: string): Promise<ReturningQueries<unknown>> {
    try {
      const result = await dbManager.instances.delete(id);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to delete instance";
      return { data: null, error: msg };
    }
  }

  // ─── Advanced Operations ──────────────────────────────────────────────────

  async getWithDestinations(id: string) {
    try {
      const instance = await dbManager.instances.findById(id);
      if (!instance.data) {
        return { data: null, error: "Instance not found" };
      }

      const destinations =
        await dbManager.instanceDestinations.listByInstance(id);
      if (destinations.error) {
        return { data: instance.data, error: destinations.error };
      }

      return {
        data: {
          instance: instance.data,
          destinations: destinations.data || [],
        },
        error: undefined,
      };
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to get instance with destinations";
      return { data: null, error: msg };
    }
  }

  async getDestinations(id: string) {
    try {
      const result = await dbManager.instanceDestinations.listByInstance(id);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to get destinations";
      return { data: [], error: msg };
    }
  }

  async addDestination(instanceId: string, destinationData: any) {
    try {
      const result = await dbManager.instanceDestinations.create({
        instance_id: instanceId,
        ...destinationData,
      });
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to add destination";
      return { data: null, error: msg };
    }
  }

  async updateDestination(destinationId: string, data: any) {
    try {
      const result = await dbManager.instanceDestinations.update(
        destinationId,
        data,
      );
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update destination";
      return { data: null, error: msg };
    }
  }

  async deleteDestination(destinationId: string) {
    try {
      const result = await dbManager.instanceDestinations.delete(destinationId);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to delete destination";
      return { data: null, error: msg };
    }
  }

  // ─── Data Mapping Operations ────────────────────────────────────────────

  async setDataMapping(destinationId: string, mappingData: any) {
    try {
      const result = await dbManager.dataMappings.upsert({
        instance_destination_id: destinationId,
        ...mappingData,
      });
      return result;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to set data mapping";
      return { data: null, error: msg };
    }
  }

  async testDataMapping(destinationId: string, testData: any) {
    try {
      const mappingResult =
        await dbManager.dataMappings.getByInstanceDestination(destinationId);
      if (!mappingResult.data) {
        return { data: null, error: "No mapping found" };
      }

      // Cast to any to match IDataMapping interface
      const mapping = mappingResult.data as any;
      const mapped = this.dataMappingService.transformData(testData, mapping);
      return { data: mapped };
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to test mapping";
      return { data: null, error: msg };
    }
  }

  async getAvailableFields(id: string) {
    try {
      const instance = await dbManager.instances.findById(id);
      if (!instance.data) {
        return { data: [], error: "Instance not found" };
      }

      // Get script to determine available output fields
      // This would need script metadata from downloaded scripts table
      const fields = this.dataMappingService.getAvailableFields(
        undefined,
        undefined,
        undefined,
      );

      return { data: fields };
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to get available fields";
      return { data: [], error: msg };
    }
  }

  // ─── Configuration Updates ─────────────────────────────────────────────

  async updateScriptParams(id: string, params: any) {
    try {
      // Cast to avoid type issues
      const update: any = {};
      update.script_parameters = params;
      const result = await dbManager.instances.update(id, update);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update script params";
      return { data: null, error: msg };
    }
  }

  async updateTriggerConfig(id: string, triggerConfig: any) {
    try {
      // Cast to avoid type issues
      const update: any = {};
      update.trigger_config = triggerConfig;
      const result = await dbManager.instances.update(id, update);
      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update trigger config";
      return { data: null, error: msg };
    }
  }

  async updateFallbackConfig(id: string, fallbackConfig: any) {
    try {
      const result = await dbManager.instances.update(id, {
        fallback_enabled: fallbackConfig.enabled,
        fallback_strategy: fallbackConfig.strategy,
      });
      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update fallback config";
      return { data: null, error: msg };
    }
  }

  async toggleActive(id: string, active: boolean) {
    try {
      const result = await dbManager.instances.update(id, {
        active: active,
      });
      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to toggle active status";
      return { data: null, error: msg };
    }
  }
}

export default InstanceServiceEnhanced;

