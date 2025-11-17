import { Tables } from '../entity';

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