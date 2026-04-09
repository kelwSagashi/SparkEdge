import { Tables } from '../db';

export type ServerTypeUpsertValues = typeof Tables.ServerTypesTable.$inferInsert;
export type ServerUpsertValues = typeof Tables.ServersTable.$inferInsert;
export type ServerEndpointsUpsertValues = typeof Tables.ServerEndpointsTable.$inferInsert;
export type CredentialUpsertValues = typeof Tables.CredentialsTable.$inferInsert;
export type DeviceUpsertValues = typeof Tables.DeviceTable.$inferInsert;
export type CodeInstanceUpsertValues = typeof Tables.CodeInstanceTable.$inferInsert;

export type ServerTypeReturningValues = typeof Tables.ServerTypesTable.$inferSelect;
export type ServerReturningValues = typeof Tables.ServersTable.$inferSelect;
export type DeviceReturningValues = typeof Tables.DeviceTable.$inferSelect;
export type ServerEndpointsReturningValues = typeof Tables.ServerEndpointsTable.$inferSelect;
export type CredentialReturningValues = typeof Tables.CredentialsTable.$inferSelect;
export type CodeInstanceReturningValues = typeof Tables.CodeInstanceTable.$inferSelect;

export type WorkflowUpsertValues = typeof Tables.WorkflowTable.$inferInsert;
export type WorkflowReturningValues = typeof Tables.WorkflowTable.$inferSelect;

export type UserUpsertValues = typeof Tables.UsersTable.$inferInsert;
export type UserReturningValues = typeof Tables.UsersTable.$inferSelect;

export type ProjectUpsertValues = typeof Tables.ProjectsTable.$inferInsert;
export type ProjectReturningValues = typeof Tables.ProjectsTable.$inferSelect;

export type ProjectMemberUpsertValues = typeof Tables.ProjectMembersTable.$inferInsert;
export type ProjectMemberReturningValues = typeof Tables.ProjectMembersTable.$inferSelect;

export type WorkflowVersionUpsertValues = typeof Tables.WorkflowVersionsTable.$inferInsert;
export type WorkflowVersionReturningValues = typeof Tables.WorkflowVersionsTable.$inferSelect;

export type WorkflowExecutionUpsertValues = typeof Tables.WorkflowExecutionsTable.$inferInsert;
export type WorkflowExecutionReturningValues = typeof Tables.WorkflowExecutionsTable.$inferSelect;

export type ReturningQueries<T> = {
	error?: unknown;
	data: T;
};