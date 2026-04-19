import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { DeviceConnectionMethods, SchemaConfig } from '../types';
import { nanoid } from 'nanoid';

// ─── Server Infrastructure ────────────────────────────────────────────────────

export const ServerTypesTable = sqliteTable('server_types', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
});

export const UsersTable = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  email: text('email').notNull().unique(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  password_hash: text('password_hash'),
  role: text('role', { enum: ['admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  is_active: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  api_key: text('api_key').$defaultFn(() => nanoid()).notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const ProjectsTable = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  description: text('description'),
  visibility: text('visibility', { enum: ['private', 'public'] }).notNull().default('private'),
  owner_id: text('owner_id').references(() => UsersTable.id, { onDelete: 'set null' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const ProjectMembersTable = sqliteTable('project_members', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  project_id: text('project_id').notNull().references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => UsersTable.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'editor', 'viewer'] }).notNull().default('viewer'),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Credentials ──────────────────────────────────────────────────────────────

export type AuthorizationsTypeField = {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  grid?: string;
  options?: { label: string; value: any }[];
};

export const AuthorizationsTypeTable = sqliteTable('auth_type', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  strategy: text('strategy').notNull(), // "bearer", "basic", "apikey"
  fields: text("fields", { mode: "json" }).$type<AuthorizationsTypeField[]>().$defaultFn(() => []),
  server_type_id: text('server_type_id').references(() => ServerTypesTable.id),
});

export const CredentialsTable = sqliteTable('credentials', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  auth_type_id: text('auth_type_id').notNull().references(() => AuthorizationsTypeTable.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).$type<{[key: string]: string}>().notNull(),
  owner_id: text('owner_id').references(() => UsersTable.id),
  project_id: text('project_id').references(() => ProjectsTable.id),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Servers ──────────────────────────────────────────────────────────────────

export const ServersTable = sqliteTable('servers', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text('type').notNull(),
  server_type_id: text('server_type_id').references(() => ServerTypesTable.id),
  driver_key: text('driver_key').notNull(),
  credential_id: text('credential_id').references(() => CredentialsTable.id, { onDelete: 'set null' }),
  headers: text("headers", { mode: "json" }).$type<Record<string, any>>().$defaultFn(() => ({})),
  project_id: text('project_id').notNull().references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  created_by: text('created_by').references(() => UsersTable.id, { onDelete: 'set null' }),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── NEW: Server Resources ─────────────────────────────────────────────────────

export const ServerResourcesTable = sqliteTable('server_resources', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  server_id: text('server_id').notNull().references(() => ServersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // "table", "sheet", "topic", "endpoint"
  config: text('config', { mode: 'json' }).notNull().$type<Record<string, any>>().$defaultFn(() => ({})),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── NEW: Resource Operations ──────────────────────────────────────────────────

export const ResourceOperationsTable = sqliteTable('resource_operations', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  resource_id: text('resource_id').notNull().references(() => ServerResourcesTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // "http_request", "sql_query", etc
  config: text('config', { mode: 'json' }).$type<Record<string, any>>().$defaultFn(() => ({})),
  input_schema: text('input_schema', { mode: 'json' }).$type<any>().$defaultFn(() => null),
  output_schema: text('output_schema', { mode: 'json' }).$type<any>().$defaultFn(() => null),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Devices ──────────────────────────────────────────────────────────────────

export const DeviceTable = sqliteTable('devices', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  device_id: text("device_id").$defaultFn(() => nanoid()).unique(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  serial_number: text('serial_number'),
  connection_method: text('connection_method', { enum: DeviceConnectionMethods }).default("none").notNull(),
  ip_address: text('ip_address'),
  location: text('location'),
  description: text('description'),
  others: text('others', { mode: 'json' }).$type<{ key: string; value: string; type: "number" | "text"; }[]>().$defaultFn(() => []),
  resource_operation_id: text('resource_operation_id').references(() => ResourceOperationsTable.id, { onDelete: 'set null' }),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const TagsTable = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  color: text('color').default('#6b7280'),
  project_id: text('project_id').references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  unq: unique().on(t.project_id, t.name)
}));

export const InstanceTagsTable = sqliteTable('instance_tags', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  instance_id: text('instance_id').notNull().references(() => InstancesTable.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => TagsTable.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Downloaded Scripts (Script Hub) ──────────────────────────────────────────

export const DownloadedScriptsTable = sqliteTable('downloaded_scripts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),

  // Identity from GitHub repo
  name: text('name').notNull(),
  description: text('description'),
  author: text('author').notNull(),
  version: text('version').notNull().default('1.0.0'),

  // Source tracking
  source: text('source', { enum: ['local', 'hub_github'] }).notNull().default('local'),
  github_repo: text('github_repo'),    // e.g. "username/repo-name"
  github_ref: text('github_ref'),      // branch or tag e.g. "main"

  // Local storage
  local_path: text('local_path').notNull(), // absolute path to the script dir
  main_file: text('main_file').notNull(),   // e.g. "main.py"
  venv_path: text('venv_path'),             // path to the venv, created on first run

  // Requirements
  requirements_file: text('requirements_file'), // e.g. "requirements.txt"
  venv_ready: integer('venv_ready', { mode: 'boolean' }).$defaultFn(() => false),

  language: text('language', { enum: ['python'] }).notNull().default('python'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().$defaultFn(() => []),
  schema_config: text('schema_config', { mode: 'json' }).$type<SchemaConfig>().$defaultFn(() => ({ inputs: [], outputs: [], output_schemas: { stdout: { type: 'object', properties: {}, required: [] } } })),

  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Instances ────────────────────────────────────────────────────────────────

export const TriggerTypes = ['interval', 'webhook', 'interval_and_webhook'] as const;
export const ExecutionTriggerTypes = ['interval', 'webhook', 'manual'] as const;
export const FallbackStrategies = ['background_job', 'active_queue'] as const;
export const InstanceStatuses = ['idle', 'running', 'paused', 'error'] as const;
export const OnErrorActions = ['log_only', 'retry', 'notify_webhook', 'stop'] as const;

export const InstancesTable = sqliteTable('instances', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),

  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().$defaultFn(() => []),

  status: text('status', { enum: InstanceStatuses }).notNull().default('idle'),
  active: integer('active', { mode: 'boolean' }).$defaultFn(() => true),

  // Project relationship
  project_id: text('project_id').notNull().references(() => ProjectsTable.id, { onDelete: 'cascade' }),

  // Device being monitored
  device_id: text('device_id').references(() => DeviceTable.id, { onDelete: 'set null' }),

  // Script to execute
  script_id: text('script_id').references(() => DownloadedScriptsTable.id, { onDelete: 'set null' }),

  // Include device data in execution context
  include_device_data: integer('include_device_data', { mode: 'boolean' }).$defaultFn(() => false),

  // Script parameters (custom values for the script)
  script_parameters: text('script_parameters', { mode: 'json' })
    .$type<Record<string, any>>()
    .notNull()
    .$defaultFn(() => ({})),

  // Trigger configuration
  trigger_type: text('trigger_type', { enum: TriggerTypes }).notNull().default('interval'),
  trigger_config: text('trigger_config', { mode: 'json' })
    .$type<{
      // For 'interval': interval in seconds
      interval_seconds?: number;
      // For 'webhook': auto-generated path exposed by Express
      webhook_path?: string;
      webhook_secret?: string;
    }>()
    .notNull()
    .$defaultFn(() => ({ interval_seconds: 60 })),

  // Fallback configuration (when primary destination fails)
  fallback_enabled: integer('fallback_enabled', { mode: 'boolean' }).$defaultFn(() => true),
  fallback_strategy: text('fallback_strategy', { enum: FallbackStrategies }).default('background_job'),
  fallback_retry_interval_seconds: integer('fallback_retry_interval_seconds').default(300),

  // Error handling
  on_error_action: text('on_error_action', { enum: OnErrorActions }).notNull().default('log_only'),
  on_error_config: text('on_error_config', { mode: 'json' })
    .$type<{
      notify_url?: string;
      max_retries?: number;
    }>()
    .$defaultFn(() => ({})),

  created_by: text('created_by').references(() => UsersTable.id, { onDelete: 'set null' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Instance Destinations and Mapping ────────────────────────────────────────

export const InstanceDestinationsTable = sqliteTable('instance_destinations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),

  instance_id: text('instance_id')
    .notNull()
    .references(() => InstancesTable.id, { onDelete: 'cascade' }),

  resource_operation_id: text('resource_operation_id')
    .notNull()
    .references(() => ResourceOperationsTable.id, { onDelete: 'cascade' }),

  enabled: integer('enabled', { mode: 'boolean' }).$defaultFn(() => true),
  priority: integer('priority').default(0),

  retry_policy: text('retry_policy', { mode: 'json' })
    .$type<{ max_retries?: number, retry_interval?: number }>()
    .$defaultFn(() => ({})),

  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const DataMappingsTable = sqliteTable('data_mappings', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  instance_destination_id: text('instance_destination_id').notNull().references(() => InstanceDestinationsTable.id, { onDelete: 'cascade' }),
  mapping: text('mapping', { mode: 'json' }).$type<Record<string, string>>().notNull().$defaultFn(() => ({})),
  payload_template: text('payload_template', { mode: 'json' }).$type<Record<string, any>>(),
  custom_fields: text('custom_fields', { mode: 'json' }).$type<{key: string, value: string}[]>(),
  transform_script: text('transform_script'),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

// ─── Instance Executions (Execution History) ──────────────────────────────────

export const ExecutionStatuses = ['queued', 'running', 'success', 'failed', 'timeout'] as const;

export const InstanceExecutionsTable = sqliteTable('instance_executions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),

  instance_id: text('instance_id').notNull().references(() => InstancesTable.id, { onDelete: 'cascade' }),

  status: text('status', { enum: ExecutionStatuses }).notNull().default('queued'),
  trigger_type: text('trigger_type', { enum: ExecutionTriggerTypes }).notNull().default('interval'),

  // Timing
  started_at: text('started_at'),
  finished_at: text('finished_at'),
  duration_ms: integer('duration_ms'),

  // Logs (stored as JSON array of log lines)
  logs: text('logs', { mode: 'json' }).$type<{
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
  }[]>().$defaultFn(() => []),

  // Result
  output: text('output'),
  error_message: text('error_message'),

  // Destination result
  destination_sent: integer('destination_sent', { mode: 'boolean' }).$defaultFn(() => false),
  fallback_used: integer('fallback_used', { mode: 'boolean' }).$defaultFn(() => false),

  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── Local Fallback Storage ───────────────────────────────────────────────────

export const FallbackItemStatuses = ['pending', 'sending', 'sent', 'failed'] as const;

export const LocalFallbackStorageTable = sqliteTable('local_fallback_storage', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),

  instance_id: text('instance_id').notNull().references(() => InstancesTable.id, { onDelete: 'cascade' }),
  destination_id: text('destination_id').references(() => InstanceDestinationsTable.id, { onDelete: 'cascade' }),
  execution_id: text('execution_id').references(() => InstanceExecutionsTable.id, { onDelete: 'set null' }),

  status: text('status', { enum: FallbackItemStatuses }).notNull().default('pending'),

  // Data payload (stored inline as JSON text)
  payload: text('payload').notNull(),

  // Optionally points to a file on disk
  filepath: text('filepath'),

  // Retry tracking
  retry_count: integer('retry_count').notNull().default(0),
  last_retry_at: text('last_retry_at'),
  next_retry_at: text('next_retry_at'),

  // Error from last attempt
  last_error: text('last_error'),

  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});





// --- MQTT Commands ---

export const MqttCommandStatuses = ['pending', 'running', 'done', 'error', 'ignored'] as const;

export const MqttCommandsTable = sqliteTable('mqtt_commands', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  command_id: text('command_id').notNull().unique(),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).$type<Record<string, any>>().$defaultFn(() => ({})),
  status: text('status', { enum: MqttCommandStatuses }).notNull().default('pending'),
  result: text('result', { mode: 'json' }).$type<Record<string, any>>(),
  error: text('error'),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  started_at: text('started_at'),
  finished_at: text('finished_at'),
});

// --- MQTT Offline Queue ---

export const MqttQueueTable = sqliteTable('mqtt_queue', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  topic: text('topic').notNull(),
  payload: text('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  last_attempt_at: text('last_attempt_at'),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// --- Edge Config ---

export const EdgeConfigTable = sqliteTable('edge_config', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  lat: text('lat'),
  lng: text('lng'),
  location_source: text('location_source').default('manual'),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// --- Edge Identity ---

export const EdgeIdentityTable = sqliteTable('edge_identity', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  edge_id: text('edge_id').notNull().unique(),
  edge_name: text('edge_name'),
  provisioned: integer('provisioned').notNull().default(0),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// --- Edge Credentials ---

export const EdgeCredentialTypes = ['mqtt'] as const;

export const EdgeCredentialsTable = sqliteTable('edge_credentials', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  type: text('type', { enum: EdgeCredentialTypes }).notNull().default('mqtt'),
  broker_url: text('broker_url'),
  username: text('username'),
  password: text('password'),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
