import { create } from 'zustand';
import type { UserReturningValues } from 'nmg8-db/src/types';
import { authApi } from '@/rest-api-client/auth.service';

type AuthState = {
  user: UserReturningValues | null;
  loading: boolean;
  error?: string | null;
  setUser: (u: UserReturningValues | null) => void;
  loadMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (u) => set({ user: u, error: null }),
  loadMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.me();
      set({ user: res.data?.data ?? null });
      console.log('Loaded user:', res.data);
    } catch (err: any) {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authApi.login({ email, password });
      await get().loadMe();
      return true;
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Login failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      await authApi.register({ email, password, first_name: name });
      await get().loadMe();
      return true;
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Registration failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore
    }
    set({ user: null });
  },
}));
