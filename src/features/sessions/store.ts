import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@/lib/types';

// ============================================================
// Store
// Sessions are persisted to localStorage via zustand persist middleware.
// Hermes backend does not provide a session list HTTP API — sessions are
// managed locally and synced on chat via conversation_id / lastResponseId.
// ============================================================

interface SessionStore {
  sessions: Session[];
  activeId: string | null;
  search: string;
  isLoading: boolean;
  dashboardAvailable: boolean;
  setSessions: (sessions: Session[]) => void;
  setActiveId: (id: string | null) => void;
  setSearch: (q: string) => void;
  setLoading: (v: boolean) => void;
  addSession: (s: Session) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  updateLastResponseId: (id: string, lastResponseId: string) => void;
  /** No-op: dashboard API not available, sessions are local-only */
  fetchFromDashboard: () => Promise<void>;
  setDashboardAvailable: (v: boolean) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeId: null,
      search: '',
      isLoading: false,
      dashboardAvailable: false,
      setSessions: (sessions) => set({ sessions }),
      setActiveId: (id) => set({ activeId: id }),
      setSearch: (search) => set({ search }),
      setLoading: (v) => set({ isLoading: v }),
      addSession: (s) => set((st) => ({ sessions: [s, ...st.sessions] })),
      removeSession: (id) =>
        set((st) => ({
          sessions: st.sessions.filter((s) => s.id !== id),
          activeId: st.activeId === id ? null : st.activeId,
        })),
      updateSession: (id, patch) =>
        set((st) => ({
          sessions: st.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      updateLastResponseId: (id, lastResponseId) =>
        set((st) => ({
          sessions: st.sessions.map((s) =>
            s.id === id ? { ...s, lastResponseId } : s
          ),
        })),
      /** Dashboard API does not exist — no-op for backward compatibility */
      fetchFromDashboard: async () => {
        // Hermes API Server has no session list endpoint.
        // Sessions are managed locally via localStorage.
        set({ dashboardAvailable: false });
      },
      setDashboardAvailable: (v) => set({ dashboardAvailable: v }),
    }),
    { name: 'hermes-sessions' }
  )
);


