# spark-edge-db — Database & Persistence Layer

This package manages the local database connection, schema definitions, and migration logic for **Spark Edge**.

It uses **Drizzle ORM** and **SQLite** (via `@libsql/client`) to store application state, configurations, command queues, and monitoring metrics locally.

## 🏗️ Architecture

*   **Database Engine**: SQLite running in WAL (Write-Ahead Logging) mode for robust local persistence.
*   **ORM**: Drizzle ORM for type-safe queries and schema definition.
*   **Migrations**: Automatically executed or resolved during application startup or migration setup, with customizable path resolution using the `SPARK_EDGE_MIGRATIONS_DIR` environment variable.

## 📡 Schemas & Entities

The package defines the following entities in `src/db/schemas.ts`:

*   **edge_settings**: Stores global configurations (e.g. edge name, cloud broker credentials).
*   **monitored_servers**: Configured servers that this Spark Edge instance is monitoring.
*   **metrics**: Historical resource utilization logs (CPU, memory, disk).
*   **commands**: Pending and executed remote commands sent by the Spark Cloud.
*   **failed_mqtt_messages**: Local message fallback queue for offline message buffering.

## 🚀 Usage

This package is consumed by the main [spark-edge](https://github.com/kelwSagashi/SparkEdge/tree/main/packages/cli) package to handle local state.

### Initializing and Querying

```typescript
import { db, schemas } from 'spark-edge-db';
import { eq } from 'drizzle-orm';

// Query edge settings
const settings = await db.select().from(schemas.edgeSettings).limit(1);
```

### Running Migrations Programmatically

```typescript
import { runMigrations } from 'spark-edge-db';

await runMigrations();
```
