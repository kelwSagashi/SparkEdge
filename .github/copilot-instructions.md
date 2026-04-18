# spark-edge Copilot Instructions

## Project Overview

**spark-edge** is a monorepo for an **edge computing automation platform** targeting photovoltaic energy monitoring systems. It's transitioning from a node-graph workflow model to a simpler **Projects & Instances** architecture. The platform runs locally on resource-constrained hardware (Raspberry Pi) with offline-first capabilities.

## Architecture & Key Patterns

### Monorepo Structure (Turbo + pnpm)

- **Root scripts**: `pnpm dev`, `pnpm build`, `pnpm db:migrate`, `pnpm db:seed`
- **Packages**:
  - `packages/cli`: Backend (Express + Node.js) - the main service
  - `packages/frontend`: React + Vite dashboard (port 5173)
  - `packages/db`: SQLite database layer (Drizzle ORM)
  - `packages/@spark-edge/di`: Custom lightweight DI container
  - `packages/extensions`: Python SDK for custom scripts

### Dependency Injection Pattern

- Uses custom `@spark-edge/di` container with decorators: `@Service()`, `@RestController()`, `@Get/@Post/@Put/@Delete`
- Controllers auto-register in `ControllerRegistry` via side-effect imports in `server.ts`
- No factory patterns - constructor injection only with circular dependency detection

Example controller pattern (`packages/cli/src/devices/device.controller.ts`):

```typescript
@RestController('/devices')
export class DevicesController {
    constructor(private readonly deviceService: DeviceService) {}
    @Get('/') async list() { ... }
}

@Service()
export class DeviceService {
    async listAll(): Promise<ReturningQueries<DeviceReturningValues[]>> {
        return dbManager.devices.listAll();
    }
}
```

### Database & Data Types

- **ORM**: Drizzle with SQLite (better-sqlite3)
- **Location**: `packages/db/monitor.db` (auto-created)
- **Type safety**: All DB operations use Drizzle's `$inferInsert/$inferSelect` types
- **Return pattern**: `ReturningQueries<T>` type wraps `{data?: T, error?: string}`
- Schemas live in `packages/db/src/db/schemas.ts`; types in `packages/db/src/types/types.ts`

### Instances Architecture

- **Instance**: Core execution unit that runs a Python script based on a trigger (scheduled or webhook)
- Each instance has: name, tags, trigger type, script reference, device context, credentials, error handling strategy
- Execution logs stored in database for monitoring and debugging
- Failed operations stored in fallback storage for retry when connectivity restored

### Frontend Architecture

- React + React Router + Vite
- Pages organized in `packages/frontend/src/pages/` (Devices, Servers, Instances, etc.)
- REST API client likely in `packages/frontend/src/rest-api-client/`
- Mock data structure in `packages/frontend/src/mock/` for development

## Critical Workflows & Commands

### Development

- **Start full stack**: `pnpm dev` (runs DB migrations/seed as predev, launches both backend & frontend)
- **Start backend only**: `cd packages/cli && pnpm dev`
- **Start frontend only**: `cd packages/frontend && pnpm dev`
- **Watch TypeScript**: `pnpm watch` (in cli package)

### Database Operations

- **Generate migration**: `pnpm db:generate` (reads schema changes)
- **Apply migrations**: `pnpm db:migrate` (auto-runs on `pnpm dev`)
- **Seed database**: `pnpm db:seed` (auto-runs on `pnpm dev`)
- **View data**: Open Prisma Studio equivalent (check db package scripts)

### Building

- **Build all packages**: `pnpm build`
- **Check types**: `pnpm typecheck` (in individual packages)
- **Clean build artifacts**: `pnpm clean`

## Project-Specific Conventions

### Response Handling

All HTTP responses use the wrapper pattern (see `response-helper.ts`):

```typescript
{ data: T, error?: string }
```

### File Organization by Feature

Each feature module (devices, servers, etc.) follows a pattern:

- `{feature}.controller.ts` - HTTP routes
- `{feature}.service.ts` - Business logic (calls dbManager)
- `{feature}.request.ts` - Request type definitions
- Example: `packages/cli/src/devices/`

### Authentication

- JWT-based in middleware (secret from `JWT_SECRET` env or 'dev-secret')
- Decoded in `server.ts` middleware, attached to request context
- Cookie-based session support via `cookie-parser`

### Error Handling Pattern

Services return wrapped responses; controllers extract data/error. Never throw - always return structured results.

## Cross-Package Communication

- **CLI ↔ DB**: Import `dbManager` from `spark-edge-db` package (already exported)
- **Frontend ↔ CLI**: HTTP REST calls to `http://localhost:5173/api/*`
- **Workspace aliases**: TypeScript `baseUrl` allows `@/` paths in cli package

## Critical Files to Understand First

1. **Architecture**: `spark-edge-spec.md` (business domain requirements)
2. **DI Container**: `packages/@spark-edge/di/src/di.ts`
3. **Server Setup**: `packages/cli/src/server.ts` (all middleware, controller registration)
4. **DB Schema Example**: `packages/db/src/db/schemas.ts` (Drizzle table definitions)
5. **Service Example**: `packages/cli/src/devices/device.service.ts`

## Known Constraints & Future Directions

- **No Docker/Redis**: Python scripts run in isolated `venv` via `child_process.spawn`
- **Queue System**: SQLite-based, no Redis - managed directly in DB tables
- **Offline-First**: Failed API calls stored in SQLite fallback storage, retried periodically
- **Hardware Target**: Raspberry Pi with limited RAM/CPU - minimize dependencies

## Common Tasks

### Adding a New REST Endpoint

1. Create `packages/cli/src/features/{name}/`
2. Add controller with `@RestController` and route decorators
3. Import side-effect in `server.ts` to auto-register
4. Add service with `@Service()` for business logic

### Adding a Database Table

1. Define schema in `packages/db/src/db/schemas.ts` using Drizzle
2. Run `pnpm db:generate` to create migration
3. Generate types in `packages/db/src/types/types.ts` using `$inferInsert/$inferSelect`
4. Create repository methods in `packages/db/src/repositories/`

### Adding Instance Features

1. Create database schema for new instance fields in `packages/db/src/db/schemas.ts`
2. Add service methods in `packages/cli/src/instances/instance.service.ts`
3. Update controller endpoints in `packages/cli/src/instances/instance.controller.ts`
4. Update frontend forms in `packages/frontend/src/pages/InstanceCreate.tsx` or `Instances.tsx`

## Environment & Dependencies

- **Node**: >=22.16
- **pnpm**: >=10.20.0
- **TypeScript**: ^5.9.3
- **Key deps**: Express, Drizzle, React 18, Vite, BullMQ (queue)
