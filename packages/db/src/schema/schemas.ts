
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import * as uuid from 'uuid';
import { AuthorizationTypes, DeviceConnectionMethods, ServerEndpointMethods } from './constants';

export const ServerTypesTable = sqliteTable('server-types', {
  id: text("id").primaryKey().$defaultFn(() => uuid.v4()),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description')
});

export const ServersTable = sqliteTable('servers', {
  id: text("id").primaryKey().$defaultFn(() => uuid.v4()),
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
  id: text("id").primaryKey().$defaultFn(() => uuid.v4()),
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
  id: text("id").primaryKey().$defaultFn(() => uuid.v4()),
  device_id: text("device_id").$defaultFn(() => uuid.v4()).unique(),
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
  id: text("id").primaryKey().$defaultFn(() => uuid.v4()),
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