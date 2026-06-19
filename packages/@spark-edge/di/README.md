# spark-edge-di — Dependency Injection Container

A lightweight, type-safe Dependency Injection (DI) library for Node.js and TypeScript, designed to handle automatic dependency resolution via decorators and `reflect-metadata`.

Used internally by **Spark Edge** to power its modular architecture and decouple core services.

## 🏗️ Features

*   **Decorator-based**: Register dependencies using the `@Service()` class decorator.
*   **Constructor Injection**: Automatically resolves and injects constructor parameters using runtime metadata.
*   **Factory Support**: Define custom instantiation logic for complex services using factories.
*   **Circular Dependency Detection**: Prevents runtime deadlocks and provides clear dependency path traces.
*   **Singleton Instances**: Reuses instantiated objects throughout the lifetime of the container.
*   **Abstract Classes**: Supports mapping abstract classes to concrete implementations manually.

## 🚀 Usage

### 1. Enable decorators in `tsconfig.json`

Ensure your TypeScript configuration has experimental decorators and metadata enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2. Define Injectable Services

```typescript
import { Service, Container } from 'spark-edge-di';

@Service()
class Logger {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

@Service()
class DatabaseService {
  constructor(private logger: Logger) {}

  query(sql: string) {
    this.logger.log(`Running: ${sql}`);
  }
}

// Retrieve instance from the container
const db = Container.get(DatabaseService);
db.query("SELECT * FROM users");
```
