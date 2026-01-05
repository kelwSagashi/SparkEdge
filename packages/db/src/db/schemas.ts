
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { AuthorizationTypes, DeviceConnectionMethods, ServerEndpointMethods } from '../types';
import { nanoid } from 'nanoid';
import type { INode, IEdge, IWorkflowSettings } from 'nmg8-workflow'

export const ServerTypesTable = sqliteTable('server-types', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description')
});

export const ServersTable = sqliteTable('servers', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text('type').notNull().references(() => ServerTypesTable.id, { onDelete: 'cascade' }),
  base_url: text("base_url").notNull(),
  auth_type: text("auth_type", { enum: AuthorizationTypes }),
  authorization: text('authorization', { mode: 'json' }),
  headers: text("headers", { mode: "json" }),
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
  others: text('others', { mode: 'json' }),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const CodeInstance = sqliteTable('code_instances', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  source: text('source', {
    enum: ['local', 'system_repo', 'remote_url']
  }).notNull(),
  url: text('url'),
  path: text('path').notNull(),
  main_file_name: text('main_file_name').notNull().default('app.py'),
  author: text('author').notNull(),
  repo: text('repo'),
  language: text('language').notNull(),
  entry_fn: text('entry_fn'),
  version: text('version').notNull().default('1.0'),
  created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updated_at: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const Workflow = sqliteTable('workflows', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  nodes: text('nodes', { mode: 'json' }).notNull().$type<INode[]>().$defaultFn(() => []),
  edges: text('edges', { mode: 'json' }).notNull().$type<IEdge[]>().$defaultFn(() => []),
  active: integer('active', {mode: 'boolean'}).$defaultFn(() => true),
  isArchived: integer('isArchived', {mode: 'boolean'}).$defaultFn(() => true),
  project_id: text('project_id').references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  settings: text('settings', { mode: 'json' }).$type<IWorkflowSettings>().notNull().$defaultFn(() => ({})),
});

export const WorkflowHistoryTable = sqliteTable('workflow_history', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  nodes: text('nodes', { mode: 'json' }).notNull().$type<INode[]>().$defaultFn(() => []),
  edges: text('edges', { mode: 'json' }).notNull().$type<IEdge[]>().$defaultFn(() => []),
  active: integer('active', {mode: 'boolean'}).$defaultFn(() => true),
  isArchived: integer('isArchived', {mode: 'boolean'}).$defaultFn(() => true),
  settings: text('settings', { mode: 'json' }).$type<IWorkflowSettings>().notNull().$defaultFn(() => ({})),
  workflow: text('workflow').notNull().references(() => Workflow.id, { onDelete: 'cascade' }),
});

/**
 * Additional entities inspired by n8n architecture
 * - UsersTable: stores user accounts and basic profile/auth info
 * - ProjectsTable: groups workflows and manages access
 * - ProjectMembersTable: membership/roles for users in projects
 * - WorkflowVersionsTable: versioned snapshots of workflows within projects
 */

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
  workflow_id: text('workflow_id').notNull().references(() => Workflow.id, { onDelete: 'cascade' }),
  project_id: text('project_id').references(() => ProjectsTable.id, { onDelete: 'cascade' }),
  version: text('version').notNull().default('1.0'),
  name: text('name').notNull(),
  nodes: text('nodes', { mode: 'json' }).notNull().$type<INode[]>().$defaultFn(() => []),
  edges: text('edges', { mode: 'json' }).notNull().$type<IEdge[]>().$defaultFn(() => []),
  settings: text('settings', { mode: 'json' }).$type<IWorkflowSettings>().notNull().$defaultFn(() => ({})),
  created_by: text('created_by').references(() => UsersTable.id, { onDelete: 'set null' }),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
