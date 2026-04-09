import { api } from '@/server/server.service';
import type { WorkflowExecutionReturningValues } from 'nmg8-db/src/types';

export class WorkflowExecutionsAPI {
  async list() {
    return api.listWorkflowExecutions();
  }

  async trigger(id: string) {
    return api.triggerWorkflowExecution(id);
  }

  async setEnabled(id: string, enabled: boolean) {
    return api.setWorkflowExecutionEnabled(id, enabled);
  }

  async delete(id: string) {
    return api.deleteWorkflowExecution(id);
  }
}

export const workflowExecutionsApi = new WorkflowExecutionsAPI();
