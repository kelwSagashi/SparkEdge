/**
 * Instance Advanced Controller
 * REST API endpoints for instance management
 */

import { RestController, Get, Post, Put, Delete } from "spark-edge-di";
import { dbManager } from "spark-edge-db";
import { InstanceService } from "./instance.service";
import { InstanceServiceEnhanced } from "./instance-service-enhanced";
import { InstanceRequest } from "./instance.request";

@RestController("/instances")
export class InstanceAdvancedController {
  constructor(
    private readonly instanceService: InstanceService,
    private readonly enhancedService: InstanceServiceEnhanced,
  ) {}

  // ─── CRUD Endpoints ────────────────────────────────────────────────────

  @Get("/")
  async listAll() {
    const result = await this.instanceService.listAll();
    return { data: result.data, error: result.error };
  }

  @Get("/project/:projectId")
  async listByProject(req: any) {
    const result = await this.instanceService.listByProject(
      req.params.projectId,
    );
    return { data: result.data, error: result.error };
  }

  @Get("/:id")
  async findById(req: InstanceRequest.IdParam) {
    const result = await this.instanceService.findById(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Post("/")
  async create(req: InstanceRequest.Create) {
    const result = await this.instanceService.create(req.body);
    return { data: result.data, error: result.error };
  }

  @Put("/:id")
  async update(req: InstanceRequest.Update) {
    const result = await this.instanceService.update(req.params.id, req.body);
    return { data: result.data, error: result.error };
  }

  @Delete("/:id")
  async delete(req: InstanceRequest.IdParam) {
    const result = await this.instanceService.delete(req.params.id);
    return { data: result.data, error: result.error };
  }

  // ─── Execution Endpoints ────────────────────────────────────────────────

  @Post("/:id/trigger")
  async triggerManual(req: InstanceRequest.TriggerManual) {
    // Execute instance manually
    const instance = await this.instanceService.findById(req.params.id);
    if (!instance.data) {
      return { data: null, error: "Instance not found" };
    }

    // TODO: Implement actual execution
    return { data: { status: "triggered" } };
  }

  @Get("/:id/executions")
  async listExecutions(req: InstanceRequest.IdParam) {
    const result = await dbManager.instanceExecutions.listByInstance(
      req.params.id,
    );
    return { data: result.data, error: result.error };
  }

  @Get("/:id/executions/:executionId")
  async getExecution(req: any) {
    const result = await dbManager.instanceExecutions.findById(
      req.params.executionId,
    );
    return { data: result.data, error: result.error };
  }

  // ─── Destination Endpoints ─────────────────────────────────────────────

  @Get("/:id/destinations")
  async getDestinations(req: InstanceRequest.IdParam) {
    const result = await this.enhancedService.getDestinations(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Post("/:id/destinations")
  async addDestination(req: InstanceRequest.Update) {
    const result = await this.enhancedService.addDestination(
      req.params.id,
      req.body,
    );
    return { data: result.data, error: result.error };
  }

  @Put("/:id/destinations/:destinationId")
  async updateDestination(req: any) {
    const result = await this.enhancedService.updateDestination(
      req.params.destinationId,
      req.body,
    );
    return { data: result.data, error: result.error };
  }

  @Delete("/:id/destinations/:destinationId")
  async deleteDestination(req: any) {
    const result = await this.enhancedService.deleteDestination(
      req.params.destinationId,
    );
    return { data: result.data, error: result.error };
  }

  // ─── Data Mapping Endpoints ────────────────────────────────────────────

  @Get("/:id/available-fields")
  async getAvailableFields(req: InstanceRequest.IdParam) {
    const result = await this.enhancedService.getAvailableFields(req.params.id);
    return { data: result.data, error: result.error };
  }

  @Post("/:id/mappings/test")
  async testDataMapping() {
    // TODO: Extract destination ID and test data from request
    return { data: { result: "test passed" } };
  }

  @Put("/:id/destinations/:destinationId/mapping")
  async setDataMapping(req: any) {
    const result = await this.enhancedService.setDataMapping(
      req.params.destinationId,
      req.body,
    );
    return { data: result.data, error: result.error };
  }

  // ─── Status & Control Endpoints ────────────────────────────────────────

  @Put("/:id/active")
  async toggleActive(req: any) {
    const result = await this.enhancedService.toggleActive(
      req.params.id,
      req.body.active,
    );
    return { data: result.data, error: result.error };
  }

  @Get("/:id/status")
  async getStatus(req: InstanceRequest.IdParam) {
    const result = await this.instanceService.findById(req.params.id);
    if (!result.data) {
      return { data: null, error: result.error };
    }
    return {
      data: { status: result.data.status, active: result.data.active },
    };
  }

  // ─── Configuration Endpoints ────────────────────────────────────────────

  @Put("/:id/trigger-config")
  async updateTriggerConfig(req: any) {
    const result = await this.enhancedService.updateTriggerConfig(
      req.params.id,
      req.body,
    );
    return { data: result.data, error: result.error };
  }

  @Put("/:id/script-params")
  async updateScriptParams(req: any) {
    const result = await this.enhancedService.updateScriptParams(
      req.params.id,
      req.body.params,
    );
    return { data: result.data, error: result.error };
  }

  @Put("/:id/fallback-config")
  async updateFallbackConfig(req: any) {
    const result = await this.enhancedService.updateFallbackConfig(
      req.params.id,
      req.body,
    );
    return { data: result.data, error: result.error };
  }
}

export default InstanceAdvancedController;

