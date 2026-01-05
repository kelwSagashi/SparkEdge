import { Tables } from '../db';

export type ServerTypeUpsertValues = typeof Tables.ServerTypesTable.$inferInsert;
export type ServerUpsertValues = typeof Tables.ServersTable.$inferInsert;
export type ServerEndpointsUpsertValues = typeof Tables.ServerEndpointsTable.$inferInsert;
export type DeviceUpsertValues = typeof Tables.DeviceTable.$inferInsert;
export type CodeInstanceUpsertValues = typeof Tables.CodeInstance.$inferInsert;

export type ServerTypeReturningValues = typeof Tables.ServerTypesTable.$inferSelect;
export type ServerReturningValues = typeof Tables.ServersTable.$inferSelect;
export type DeviceReturningValues = typeof Tables.DeviceTable.$inferSelect;
export type ServerEndpointsReturningValues = typeof Tables.ServerEndpointsTable.$inferSelect;
export type CodeInstanceReturningValues = typeof Tables.CodeInstance.$inferSelect;

export type WorkflowUpsertValues = typeof Tables.Workflow.$inferInsert;
export type WorkflowReturningValues = typeof Tables.Workflow.$inferSelect;

export type UserUpsertValues = typeof Tables.UsersTable.$inferInsert;
export type UserReturningValues = typeof Tables.UsersTable.$inferSelect;

export type ProjectUpsertValues = typeof Tables.ProjectsTable.$inferInsert;
export type ProjectReturningValues = typeof Tables.ProjectsTable.$inferSelect;

export type ProjectMemberUpsertValues = typeof Tables.ProjectMembersTable.$inferInsert;
export type ProjectMemberReturningValues = typeof Tables.ProjectMembersTable.$inferSelect;

export type WorkflowVersionUpsertValues = typeof Tables.WorkflowVersionsTable.$inferInsert;
export type WorkflowVersionReturningValues = typeof Tables.WorkflowVersionsTable.$inferSelect;

export type ReturningQueries<T> = {
	error?: unknown;
	data: T;
};