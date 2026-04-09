
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { AuthorizationTypes, DeviceConnectionMethods, ServerEndpointMethods } from '../types';
import { nanoid } from 'nanoid';
import { type INode, type IEdge, type IWorkflowSettings, WorkflowExecuteModeValues } from 'nmg8-workflow'

export const ServerTypesTable = sqliteTable('server_types', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description')
});

export const CredentialsTable = sqliteTable('credentials', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text("type", { enum: AuthorizationTypes }).notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  owner_id: text('owner_id').references(() => UsersTable.id),
  project_id: text('project_id').references(() => ProjectsTable.id),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});


export const ServersTable = sqliteTable('servers', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text('type').notNull().references(() => ServerTypesTable.id, { onDelete: 'cascade' }),
  base_url: text("base_url").notNull(),
  credential_id: text('credential_id').references(() => CredentialsTable.id, { onDelete: 'set null' }),
  headers: text("headers", { mode: "json" }),

  project_id: text('project_id')
  .notNull()
  .references(() => ProjectsTable.id, { onDelete: 'cascade' }),

  created_by: text('created_by')
    .references(() => UsersTable.id, { onDelete: 'set null' }),

  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const ServerEndpointsTable = sqliteTable('server_endpoints', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  server_id: text('server_id')
    .notNull()
    .references(() => ServersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  path: text('path').notNull(),
  payload_schema: text('payload_schema'),
  response_schema: text('response_schema'),
  method: text('method', {
    enum: ServerEndpointMethods,
  }).notNull(),
  headers: text("headers", { mode: "json" }),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const DeviceTable = sqliteTable('devices', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  device_id: text("device_id").$defaultFn(() => nanoid()).unique(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  serial_number: text('serial_number'),
  connection_method: text('connection_method', {
    enum: DeviceConnectionMethods
  }).default("none").notNull(),
  ip_address: text('ip_address'),
  location: text('location'),
  description: text('description'),
  others: text('others', { mode: 'json' }).$type<{
    key: string;
    value: string;
    type: "number" | "text";
  }[]>().$defaultFn(() => []),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const CodeInstanceTable = sqliteTable('code_instances', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  source: text('source', {
    enum: ['local', 'system_repo', 'remote_url']
  }).notNull(),
  url: text('url'),
  path: text('path').notNull(),
  main_file_name: text('main_file_name').notNull(),
  author: text('author').notNull(),
  repo: text('repo'),
  language: text('language').notNull(),
  entry_fn: text('entry_fn'),
  version: text('version').notNull().default('1.0'),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const WorkflowTable = sqliteTable('workflows', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  nodes: text('nodes', { mode: 'json' }).notNull().$type<INode[]>().$defaultFn(() => []),
  edges: text('edges', { mode: 'json' }).notNull().$type<IEdge[]>().$defaultFn(() => []),
  active: integer('active', {mode: 'boolean'}).$defaultFn(() => true),
  isArchived: integer('isArchived', {mode: 'boolean'}).$defaultFn(() => true),
  project_id: text('project_id').references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  settings: text('settings', { mode: 'json' }).$type<IWorkflowSettings>().notNull().$defaultFn(() => ({})),
});

export const UsersTable = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  email: text('email').notNull().unique(),
  first_name: text('first_name'),
  last_name: text('last_name'),
  // store password hashes only
  password_hash: text('password_hash'),
  role: text('role', { enum: ['admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  is_active: integer('is_active', { mode: 'boolean' }).$defaultFn(() => true),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

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

export const WorkflowVersionsTable = sqliteTable('workflow_versions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workflow_id: text('workflow_id').notNull().references(() => WorkflowTable.id, { onDelete: 'cascade' }),
  project_id: text('project_id').references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  version: text('version').notNull().default('1.0'),
  name: text('name').notNull(),
  nodes: text('nodes', { mode: 'json' }).notNull().$type<INode[]>().$defaultFn(() => []),
  edges: text('edges', { mode: 'json' }).notNull().$type<IEdge[]>().$defaultFn(() => []),
  settings: text('settings', { mode: 'json' }).$type<IWorkflowSettings>().notNull().$defaultFn(() => ({})),
  created_by: text('created_by').references(() => UsersTable.id, { onDelete: 'set null' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const WorkflowExecutionsTable = sqliteTable('workflow_executions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  workflow_id: text('workflow_id').notNull().references(() => WorkflowTable.id, { onDelete: 'cascade' }),
  
  mode: text('mode', { enum: WorkflowExecuteModeValues }).notNull().default('manual'),

  status: text('status', { enum: ['idle', 'running', 'failed', 'completed', 'stoped'] }).notNull().default('idle'),

  enabled: integer('enabled', { mode: 'boolean' }).$defaultFn(() => true),
  created_by: text('created_by').references(() => UsersTable.id, { onDelete: 'set null' }),
  
  started_at: text('started_at'),
  stopped_at: text('stopped_at'),
  deleted_at: text('deleted_at'),

  wait_till: text('wait_till'),

  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
