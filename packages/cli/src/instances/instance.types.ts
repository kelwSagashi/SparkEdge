/**
 * Instance domain types and interfaces
 */

import type {
  ResourceOperationReturningValues,
  DeviceReturningValues,
  DownloadedScriptReturningValues,
} from "nmg8-db/src/types";

export type TriggerType = "interval" | "webhook" | "interval_and_webhook";
export type FallbackStrategy = "background_job" | "active_queue";
export type OnErrorAction = "log_only" | "retry" | "notify_webhook" | "stop";
export type InstanceStatus = "idle" | "running" | "paused" | "error";
export type ExecutionTriggerType = "interval" | "webhook" | "manual";

/**
 * Trigger configuration for different trigger types
 */
export interface ITriggerConfig {
  // For 'interval' and 'interval_and_webhook'
  interval_seconds?: number;

  // For 'webhook' and 'interval_and_webhook'
  webhook_path?: string;
  webhook_secret?: string;
}

/**
 * Fallback configuration
 */
export interface IFallbackConfig {
  enabled: boolean;
  strategy: FallbackStrategy;
  retry_interval_seconds: number;
  max_retries?: number;
}

/**
 * Error handling configuration
 */
export interface IErrorConfig {
  action: OnErrorAction;
  notify_url?: string;
  max_retries?: number;
}

/**
 * Script parameter input (what the script expects)
 */
export interface IScriptParameter {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  required: boolean;
  default?: any;
  source?: "device_data" | "manual" | "both"; // Where value comes from
}

/**
 * Script parameter mapping/value
 */
export interface IScriptParameterValue {
  key: string;
  value: any;
  sourceType: "device_data" | "manual" | "device_field"; // How the value was set
  deviceFieldKey?: string; // If from device_data, which field
}

/**
 * Data field that can be sent to destination
 * Can come from script output or device data
 */
export interface IDataField {
  label: string;
  key: string;
  type: "string" | "number" | "boolean" | "json";
  source: "script_output" | "device_data" | "custom";
  sourceKey?: string; // For script_output or device_data
}

/**
 * Data mapping configuration
 * Maps available data fields to resource operation input schema fields
 */
export interface IDataMapping {
  instance_destination_id: string;

  // Raw mapping: target_schema_field -> source_data_field
  mapping: Record<string, string>;

  // Optional base payload template (JSON)
  payload_template?: Record<string, any>;

  // Optional custom fields: key-value pairs
  custom_fields?: { key: string; value: string }[];

  // Optional custom transform script (JavaScript)
  transform_script?: string;

  // Tracked fields for validation
  available_fields?: IDataField[];
  required_fields?: string[];
}

/**
 * Instance destination - where to send data
 */
export interface IInstanceDestination {
  id: string;
  instance_id: string;
  resource_operation_id: string;
  enabled: boolean;
  priority: number;
  retry_policy?: {
    max_retries?: number;
    retry_interval?: number;
  };

  // Related resource operation (populated from DB)
  resource_operation?: ResourceOperationReturningValues;
}

/**
 * Complete instance configuration for creation/update
 */
export interface IInstanceConfig {
  // Basic info
  name: string;
  description?: string;
  project_id: string;
  tags?: string[];

  // Script and device
  script_id: string;
  device_id?: string;

  // Script parameters
  script_parameters: IScriptParameterValue[];

  // Trigger
  trigger_type: TriggerType;
  trigger_config: ITriggerConfig;

  // Destinations and mapping
  destinations: {
    resource_operation_id: string;
    enabled: boolean;
    priority: number;
    retry_policy?: {
      max_retries?: number;
      retry_interval?: number;
    };
    data_mapping: IDataMapping;
  }[];

  // Include device data in sending
  include_device_data: boolean;

  // Fallback
  fallback_config: IFallbackConfig;

  // Error handling
  error_config: IErrorConfig;

  // Active
  active: boolean;
}

/**
 * Script execution context
 */
export interface IExecutionContext {
  instanceId: string;
  executionId: string;
  device?: DeviceReturningValues;
  script: DownloadedScriptReturningValues;
  scriptParameters: Record<string, any>;
  triggerType: ExecutionTriggerType;
}

/**
 * Execution output
 */
export interface IExecutionOutput {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  logs: IExecutionLog[];
}

/**
 * Execution log entry
 */
export interface IExecutionLog {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
}
