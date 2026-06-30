/**
 * CloudIntegration Configuration Module
 *
 * Centralizes all SparkEdge configuration in a single place.
 *
 * Priority chain (highest to lowest):
 *  1. spark-edge.config.yml  (in process.cwd() — user-editable)
 *  2. Environment variables   (.env / Docker / CI)
 *  3. Built-in defaults
 *
 * Usage:
 *   import { appConfig } from 'spark-edge-core';
 *   appConfig.cloud.url        // → SPARK_CLOUD_URL
 *   appConfig.cloud.mqtt_url   // → MQTT_URL
 *   appConfig.auth.jwt_secret  // → JWT_SECRET
 *   appConfig.db.file          // → DB_FILE_NAME
 *   appConfig.server.port      // → PORT
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CloudIntegrationConfig {
  /** Spark Cloud REST API base URL */
  url: string;
  /** MQTT broker URL used when registering a new Edge via the cloud simulator */
  mqtt_url: string;
}

export interface DbConfig {
  /** Path (relative to cwd or absolute) to the SQLite database file */
  file: string;
}

export interface AuthConfig {
  /** Secret key used for signing JWT tokens */
  jwt_secret: string;
}

export interface ServerConfig {
  /** HTTP port the SparkEdge backend listens on */
  port: number;
}

export interface SparkEdgeConfig {
  cloud: CloudIntegrationConfig;
  db: DbConfig;
  auth: AuthConfig;
  server: ServerConfig;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: SparkEdgeConfig = {
  cloud: {
    url: 'https://sparkcloud.okelwen.site',
    mqtt_url: 'mqtt://localhost:1883',
  },
  db: {
    file: 'packages/db/monitor.db',
  },
  auth: {
    jwt_secret: 'dev-secret',
  },
  server: {
    port: 3009,
  },
};

// ─── YAML Loader ──────────────────────────────────────────────────────────────

const CONFIG_FILENAME = 'spark-edge.config.yml';

/**
 * Resolves the location of the bundled default config template.
 *
 * When running from the published npm package, the template is at:
 *   <package_root>/dist/spark-edge.config.yml
 *
 * When running from the monorepo (dev mode), it falls back to the
 * monorepo root two levels above packages/core/src/config/.
 */
function getBundledConfigPath(): string | null {
  // Attempt 1: dist/ sibling of this file (compiled package structure)
  //   packages/cli/dist/spark-edge.config.yml  ← copied by prepare-assets.js
  //   __dirname resolves to packages/core/dist/config/ at runtime
  const candidates = [
    // Published package: node_modules/spark-edge/dist/spark-edge.config.yml
    path.resolve(__dirname, '..', 'spark-edge.config.yml'),
    // Monorepo dev: packages/cli/dist/spark-edge.config.yml
    path.resolve(__dirname, '..', '..', '..', '..', 'cli', 'dist', 'spark-edge.config.yml'),
    // Monorepo root fallback (running tsc directly)
    path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'spark-edge.config.yml'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Ensures the user has a spark-edge.config.yml in their working directory.
 *
 * If none exists, copies the bundled template there so the user can edit it.
 * This only runs once (on first boot after install).
 */
function ensureUserConfig(userConfigPath: string): void {
  if (fs.existsSync(userConfigPath)) return;

  const bundled = getBundledConfigPath();
  if (!bundled) {
    console.warn('[Config] No bundled config template found. Using built-in defaults.');
    return;
  }

  try {
    fs.copyFileSync(bundled, userConfigPath);
    console.log(`[Config] Created default config at ${userConfigPath}`);
    console.log('[Config] Edit this file to configure your SparkEdge instance.');
  } catch (err: any) {
    console.warn(`[Config] Could not write default config to ${userConfigPath}: ${err.message}`);
  }
}

function readYamlConfig(): Partial<SparkEdgeConfig> {
  // 1. Always prefer the user-editable config in their working directory
  const userConfigPath = path.resolve(process.cwd(), CONFIG_FILENAME);

  // 2. On first run, bootstrap the user config from the bundled template
  ensureUserConfig(userConfigPath);

  // 3. Determine which file to actually read (user config > bundled template)
  const configPath = fs.existsSync(userConfigPath)
    ? userConfigPath
    : getBundledConfigPath();

  if (!configPath) {
    console.warn('[Config] No config file found anywhere. Using built-in defaults.');
    return {};
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(raw) as Partial<SparkEdgeConfig>;

    const source = configPath === userConfigPath ? 'user config' : 'bundled template';
    console.log(`[Config] Loaded from ${source}: ${configPath}`);

    return parsed ?? {};
  } catch (err: any) {
    console.warn(`[Config] Failed to read ${configPath}: ${err.message}. Using built-in defaults.`);
    return {};
  }
}

// ─── Env Variable Override ────────────────────────────────────────────────────

function applyEnvOverrides(config: SparkEdgeConfig): SparkEdgeConfig {
  return {
    cloud: {
      url: process.env.SPARK_CLOUD_URL || config.cloud.url,
      mqtt_url: process.env.MQTT_URL || config.cloud.mqtt_url,
    },
    db: {
      file: process.env.DB_FILE_NAME || config.db.file,
    },
    auth: {
      jwt_secret: process.env.JWT_SECRET || config.auth.jwt_secret,
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : config.server.port,
    },
  };
}

// ─── Config Builder ───────────────────────────────────────────────────────────

function buildConfig(): SparkEdgeConfig {
  const yaml = readYamlConfig();

  // Deep merge: defaults ← yaml ← env
  const merged: SparkEdgeConfig = {
    cloud: {
      url: yaml.cloud?.url ?? DEFAULTS.cloud.url,
      mqtt_url: yaml.cloud?.mqtt_url ?? DEFAULTS.cloud.mqtt_url,
    },
    db: {
      file: yaml.db?.file ?? DEFAULTS.db.file,
    },
    auth: {
      jwt_secret: yaml.auth?.jwt_secret ?? DEFAULTS.auth.jwt_secret,
    },
    server: {
      port: yaml.server?.port ?? DEFAULTS.server.port,
    },
  };

  return applyEnvOverrides(merged);
}

// ─── Singleton ─────────────────────────────────────────────────────────────────

let _config: SparkEdgeConfig | null = null;

/**
 * Loads and caches the application configuration.
 * Subsequent calls return the cached value.
 * Call `reloadConfig()` to force a reload from disk.
 */
export function loadConfig(): SparkEdgeConfig {
  if (!_config) {
    _config = buildConfig();
  }
  return _config;
}

/**
 * Forces a reload of the configuration from disk.
 * Useful after the user saves new settings via the UI.
 */
export function reloadConfig(): SparkEdgeConfig {
  _config = null;
  return loadConfig();
}

/**
 * Saves a (possibly partial) config update to spark-edge.config.yml.
 * Merges with the current config before writing.
 */
export function saveConfig(updates: Partial<SparkEdgeConfig>): SparkEdgeConfig {
  const current = loadConfig();
  const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);

  const merged: SparkEdgeConfig = {
    cloud: { ...current.cloud, ...(updates.cloud ?? {}) },
    db: { ...current.db, ...(updates.db ?? {}) },
    auth: { ...current.auth, ...(updates.auth ?? {}) },
    server: { ...current.server, ...(updates.server ?? {}) },
  };

  const yamlContent = [
    '# SparkEdge Configuration',
    '# Edit this file to configure your SparkEdge instance.',
    '# Changes require a service restart to take full effect.',
    '#',
    '# Documentation: https://github.com/sparkcloud/spark-edge',
    '',
    yaml.dump(merged, { indent: 2, lineWidth: 120 }),
  ].join('\n');

  fs.writeFileSync(configPath, yamlContent, 'utf8');
  console.log(`[Config] Configuration saved to ${configPath}`);

  // Reload into memory
  return reloadConfig();
}

/**
 * The application config singleton.
 * Lazily initialized on first access.
 */
export const appConfig: SparkEdgeConfig = new Proxy({} as SparkEdgeConfig, {
  get(_target, prop: keyof SparkEdgeConfig) {
    return loadConfig()[prop];
  },
});
