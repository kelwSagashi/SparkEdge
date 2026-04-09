import { create } from 'zustand';
import type { WorkflowExecutionReturningValues } from 'nmg8-db/src/types';
import { workflowExecutionsApi } from '@/rest-api-client/workflow-executions.service';

type WorkflowExecutionsState = {
  executions: WorkflowExecutionReturningValues[];
  loading: boolean;
  error?: string | null;
  loadAll: () => Promise<void>;
  trigger: (id: string) => Promise<boolean>;
  setEnabled: (id: string, enabled: boolean) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
};

export const useWorkflowExecutionsStore = create<WorkflowExecutionsState>((set, get) => ({
  executions: [],
  loading: false,
  error: null,
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const res = await workflowExecutionsApi.list();
      set({ executions: res.data?.data ?? res.data ?? [], loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? String(err), loading: false });
    }
  },
  trigger: async (id) => {
    set({ loading: true });
    try {
      await workflowExecutionsApi.trigger(id);
      await get().loadAll();
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? String(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  setEnabled: async (id, enabled) => {
    set({ loading: true });
    try {
      await workflowExecutionsApi.setEnabled(id, enabled);
      await get().loadAll();
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? String(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  remove: async (id) => {
    set({ loading: true });
    try {
      await workflowExecutionsApi.delete(id);
      await get().loadAll();
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? String(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));
