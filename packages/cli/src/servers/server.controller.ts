import { ServerService } from "./server.service";
import type ServerRequest from "./server.request";
import { Delete, Get, Post, Put, RestController } from "@spark-edge/di";

@RestController("/servers")
export class ServersController {
  constructor(readonly serverService: ServerService) {}

  @Get("/")
  async list() {
    return this.serverService.list();
  }

  @Get("/:id")
  async find(request: ServerRequest.IdParam) {
    return this.serverService.find(request.params.id);
  }

  @Get("/:id/resources")
  async listResources(request: ServerRequest.IdParam) {
    return this.serverService.listResources(request.params.id);
  }

  @Get("/:id/endpoints")
  async listEndpoints(request: ServerRequest.IdParam) {
    // Retorna todas as operações de todos os recursos do servidor
    return this.serverService.listResources(request.params.id);
  }

  @Post("/execute")
  async execute(request: ServerRequest.Execute) {
    return this.serverService.executeOperation(
      request.body.resource_operation_id,
      request.body.payload,
    );
  }

  @Post("/")
  async create(request: ServerRequest.Create) {
    return this.serverService.create(request.body);
  }

  @Post("/register")
  async register(request: ServerRequest.Register) {
    return this.serverService.register(request.body);
  }

  @Put("/:id")
  async update(request: ServerRequest.Update) {
    return this.serverService.update(request.params.id, request.body);
  }

  @Delete("/:id")
  async delete(request: ServerRequest.IdParam) {
    return this.serverService.remove(request.params.id);
  }
}

export default ServersController;

