# spark-edge-core — MQTT Module

This package manages all MQTT communication for the **Spark Edge** instance. It handles identity persistence, secure credential management, topic subscription, and a robust command/response protocol with the Spark Cloud.

## 🏗️ Architecture

### 1. Identity & Credentials
*   **Edge ID**: Each instance generates a unique, persistent `edge_id` stored in the local database. This ID is used as the `clientId` and as part of the topic hierarchy.
*   **Secure Storage**: MQTT credentials (broker URL, username, password) are persisted in the `monitor.db` using Drizzle ORM. They can be updated dynamically via the local dashboard or CLI.
*   **Provisioning**: Supports transparent transitions from local/default credentials to cloud-provisioned credentials.

### 2. Topic Hierarchy
All topics follow the pattern: `spark/{edge_id}/{subject}`

| Topic | Direction | Purpose |
| :--- | :--- | :--- |
| `spark/{id}/status` | Outbound | Availability (Online/Offline) with Retention. |
| `spark/{id}/heartbeat`| Outbound | Periodic liveness signaling (every 30s). |
| `spark/{id}/commands` | Inbound | Remote execution requests from Spark Cloud. |
| `spark/{id}/responses`| Outbound | Execution results and status updates for commands. |
| `spark/{id}/logs` | Outbound | Real-time system and application log stream. |
| `spark/{id}/metrics` | Outbound | System performance and instance metrics. |

---

## 📡 Capabilities

### 🟢 Status & Presence
The module automatically manages the edge's presence.
*   **Online**: Published when the MQTT client connects.
*   **Offline (LWT)**: Uses a "Last Will and Testament" message configured at the broker level to notify the cloud if the edge disconnects unexpectedly.
*   **Graceful Offline**: Published during a controlled shutdown.

### 💓 Heartbeats
Automatic periodic messages that confirm the background services are alive and the event loop is active.

### 📥 Command Processing
Handles remote commands with the following features:
*   **JSON Validation**: Only well-formed JSON commands are accepted.
*   **Idempotency**: Every command must have a unique `id`. Repeated IDs are ignored to prevent duplicate execution.
*   **Persistence**: Commands are saved as `pending` in the local DB before execution starts.
*   **Dispatcher**: Commands are passed to the CLI layer for execution (e.g., running shell scripts or monitoring instances).

### 📤 Response Protocol
When a command finishes or changes state, a response is published:
```json
{
  "command_id": "uuid",
  "status": "done" | "error" | "running",
  "result": { ... },
  "error": "Short description if failed",
  "timestamp": "ISO-8601"
}
```

### 📜 Real-time Logs
Allows streaming internal logs to the cloud for remote debugging.

### 🔄 Queueing & Reliability
If the MQTT broker is temporarily unreachable, outbound messages (like command responses) are saved to a **Local Fallback Storage**.
*   **Retry Logic**: The machine automatically attempts to flush the queue every 60 seconds once the connection is restored.
*   **Persistence**: The queue survives application restarts.

---

## 🚀 How to use

### Starting the MQTT Client
The CLI layer typically initializes the client:
```typescript
import { mqttClient, mqttSubscriber, mqttService } from 'spark-edge-core';

// 1. Connect
await mqttClient.connect();

// 2. Subscribe to commands
await mqttSubscriber.subscribe();

// 3. Start background services
mqttService.startHeartbeat();
mqttService.startQueueRetry();
```

### Publishing a response
```typescript
import { mqttService } from 'spark-edge-core';

await mqttService.publishResponse(commandId, 'done', { output: 'Hello World' });
```
