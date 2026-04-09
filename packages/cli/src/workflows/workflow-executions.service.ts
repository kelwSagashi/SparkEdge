import { Service } from '@nmg8/di';
import { dbManager } from 'nmg8-db';
import type { WorkflowExecutionUpsertValues } from 'nmg8-db/src/types';

@Service()
export class WorkflowExecutionsService {
  async create(values: WorkflowExecutionUpsertValues) {
    return dbManager.workflowExecutions.create(values as any);
  }

  async update(id: string, values: WorkflowExecutionUpsertValues) {
    return dbManager.workflowExecutions.upsert({ id, ...values });
  }

  async find(id: string) {
    return dbManager.workflowExecutions.findById(id);
  }

  async list() {
    return dbManager.workflowExecutions.listAll();
  }

  async listByWorkflow(workflow_id: string) {
    return dbManager.workflowExecutions.listByWorkflow(workflow_id);
  }

  async remove(id: string) {
    return dbManager.workflowExecutions.delete(id);
  }

  async setEnabled(id: string, enabled: boolean) {
    return dbManager.workflowExecutions.setEnabled(id, enabled);
  }

  async trigger(id: string) {
    // mark as running and set started_at; actual execution should be handled by a worker
    const now = new Date().toISOString();
    const res = dbManager.workflowExecutions.updateStatus(id, { status: 'running', started_at: now });
    // For now, we don't execute the workflow here; return current state
    return res;
  }
}

export default WorkflowExecutionsService;
