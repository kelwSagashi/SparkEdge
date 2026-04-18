import { AuthenticatedRequest } from "@/auth/authenticated-request";
import type {
  IInstanceConfig,
  IScriptParameterValue,
} from "./instance.types";

/**
 * Instance Request Namespace
 */
export namespace InstanceRequest {
  /**
   * Full instance payload with all configuration
   */
  export interface InstancePayload extends IInstanceConfig {}

  /**
   * Create instance request
   */
  export type Create = AuthenticatedRequest<{}, {}, InstancePayload>;

  /**
   * Update instance request
   */
  export type Update = AuthenticatedRequest<
    { id: string },
    {},
    Partial<InstancePayload>
  >;

  /**
   * Get instance by ID
   */
  export type IdParam = AuthenticatedRequest<{ id: string }>;

  /**
   * List instances by project
   */
  export type ListByProject = AuthenticatedRequest<{ project_id: string }>;

  /**
   * Manually trigger instance execution
   */
  export type TriggerManual = AuthenticatedRequest<
    { id: string },
    {},
    { reason?: string }
  >;

  /**
   * Get destinations with mappings
   */
  export type GetDestinations = AuthenticatedRequest<{ id: string }>;

  /**
   * Validate script parameters
   */
  export type ValidateScriptParams = AuthenticatedRequest<
    { scriptId: string },
    {},
    { parameters: IScriptParameterValue[] }
  >;

  /**
   * Test data mapping (dry run)
   */
  export type TestDataMapping = AuthenticatedRequest<
    { id: string },
    {},
    {
      destinationId: string;
      sampleData: Record<string, any>;
    }
  >;
}

export default InstanceRequest;

