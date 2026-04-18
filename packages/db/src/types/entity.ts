// entity.ts — Entidades de domínio do spark-edge
// As entidades de workflow foram removidas. Adicionar novas entidades aqui conforme necessário.

import type { InstanceReturningValues } from "./types";

export class InstanceEntity {
  id?: string;
  name: string;
  description: string | null;
  tags: string[];
  status: InstanceReturningValues['status'];
  active: boolean | null;
  project_id: string;
  device_id: string | null;
  script_id: string | null;
  trigger_type: InstanceReturningValues['trigger_type'];
  trigger_config: InstanceReturningValues['trigger_config'];
  fallback_enabled: boolean | null;
  fallback_strategy: InstanceReturningValues['fallback_strategy'];
  fallback_retry_interval_seconds: number | null;
  on_error_action: InstanceReturningValues['on_error_action'];
  on_error_config: InstanceReturningValues['on_error_config'];
  created_by: string | null;

  constructor(values: Omit<InstanceReturningValues, 'created_at' | 'updated_at'>) {
    this.id = values.id;
    this.name = values.name;
    this.description = values.description ?? null;
    this.tags = values.tags ?? [];
    this.status = values.status;
    this.active = values.active ?? true;
    this.project_id = values.project_id;
    this.device_id = values.device_id ?? null;
    this.script_id = values.script_id ?? null;
    this.trigger_type = values.trigger_type;
    this.trigger_config = values.trigger_config;
    this.fallback_enabled = values.fallback_enabled ?? true;
    this.fallback_strategy = values.fallback_strategy ?? null;
    this.fallback_retry_interval_seconds = values.fallback_retry_interval_seconds ?? null;
    this.on_error_action = values.on_error_action;
    this.on_error_config = values.on_error_config ?? null;
    this.created_by = values.created_by ?? null;
  }
}




