import { Tables } from '../db';

// ─── Server Infrastructure ────────────────────────────────────────────────────

export type ServerTypeUpsertValues = typeof Tables.ServerTypesTable.$inferInsert;
export type ServerTypeReturningValues = typeof Tables.ServerTypesTable.$inferSelect;

export type AuthorizationsTypeUpsertValues = typeof Tables.AuthorizationsTypeTable.$inferInsert;
export type AuthorizationsTypeReturningValues = typeof Tables.AuthorizationsTypeTable.$inferSelect;

export type ServerUpsertValues = typeof Tables.ServersTable.$inferInsert;
export type ServerReturningValues = typeof Tables.ServersTable.$inferSelect;

export type ServerResourceUpsertValues = typeof Tables.ServerResourcesTable.$inferInsert;
export type ServerResourceReturningValues = typeof Tables.ServerResourcesTable.$inferSelect;

export type ResourceOperationUpsertValues = typeof Tables.ResourceOperationsTable.$inferInsert;
export type ResourceOperationReturningValues = typeof Tables.ResourceOperationsTable.$inferSelect;

export type CredentialUpsertValues = typeof Tables.CredentialsTable.$inferInsert;
export type CredentialReturningValues = typeof Tables.CredentialsTable.$inferSelect;

// ─── Devices ──────────────────────────────────────────────────────────────────

export type DeviceUpsertValues = typeof Tables.DeviceTable.$inferInsert;
export type DeviceReturningValues = typeof Tables.DeviceTable.$inferSelect;

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserUpsertValues = typeof Tables.UsersTable.$inferInsert;
export type UserReturningValues = typeof Tables.UsersTable.$inferSelect;

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectUpsertValues = typeof Tables.ProjectsTable.$inferInsert;
export type ProjectReturningValues = typeof Tables.ProjectsTable.$inferSelect;

export type ProjectMemberUpsertValues = typeof Tables.ProjectMembersTable.$inferInsert;
export type ProjectMemberReturningValues = typeof Tables.ProjectMembersTable.$inferSelect;

// ─── Downloaded Scripts ───────────────────────────────────────────────────────

export type DownloadedScriptUpsertValues = typeof Tables.DownloadedScriptsTable.$inferInsert;
export type DownloadedScriptReturningValues = typeof Tables.DownloadedScriptsTable.$inferSelect;

// ─── Instances ────────────────────────────────────────────────────────────────

export type InstanceUpsertValues = typeof Tables.InstancesTable.$inferInsert;
export type InstanceReturningValues = typeof Tables.InstancesTable.$inferSelect;

// ─── Instance Executions ──────────────────────────────────────────────────────

export type InstanceExecutionUpsertValues = typeof Tables.InstanceExecutionsTable.$inferInsert;
export type InstanceExecutionReturningValues = typeof Tables.InstanceExecutionsTable.$inferSelect;

// ─── Instance Destinations and Mapping ────────────────────────────────────────

export type InstanceDestinationUpsertValues = typeof Tables.InstanceDestinationsTable.$inferInsert;
export type InstanceDestinationReturningValues = typeof Tables.InstanceDestinationsTable.$inferSelect;

export type DataMappingUpsertValues = typeof Tables.DataMappingsTable.$inferInsert;
export type DataMappingReturningValues = typeof Tables.DataMappingsTable.$inferSelect;

// ─── Local Fallback Storage ───────────────────────────────────────────────────

export type LocalFallbackItemUpsertValues = typeof Tables.LocalFallbackStorageTable.$inferInsert;
export type LocalFallbackItemReturningValues = typeof Tables.LocalFallbackStorageTable.$inferSelect;

// ─── Tags ─────────────────────────────────────────────────────────────────────

export type TagUpsertValues = typeof Tables.TagsTable.$inferInsert;
export type TagReturningValues = typeof Tables.TagsTable.$inferSelect;

export type InstanceTagUpsertValues = typeof Tables.InstanceTagsTable.$inferInsert;
export type InstanceTagReturningValues = typeof Tables.InstanceTagsTable.$inferSelect;

// ─── Utility ──────────────────────────────────────────────────────────────────

export type ReturningQueries<T> = {
  error?: unknown;
  data: T;
};