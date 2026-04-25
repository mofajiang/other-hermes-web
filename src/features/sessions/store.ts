import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@/lib/types';
import { fetchSessions as fetchSessionsApi } from '@/lib/dashboard-connection';

interface DashboardSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  model_id?: string;
}

const STATUS_MAP: Record<string, string> = {
  running: 'running',
  completed: 'completed',
  error: 'error',
  pending_approval: 'pending_approval',
};

// ============================================================
// Store
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
  fetchFromDashboard: () => Promise<void>;
  setDashboardAvailable: (v: boolean) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
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
      fetchFromDashboard: async () => {
        set({ isLoading: true });
        try {
          const existing = get().sessions;
          const dashboardSessions = await fetchSessionsApi();
          // Merge: keep local lastResponseId/conversationId for matched sessions
          const merged = dashboardSessions.map((ds) => {
            const local = existing.find((s) => s.id === ds.id);
            return {
              id: ds.id,
              title: ds.title || '未命名会话',
              status: (STATUS_MAP[ds.status] || 'completed') as Session['status'],
              createdAt: ds.created_at,
              updatedAt: ds.updated_at,
              modelId: ds.model_id,
              // Preserve local-only fields
              lastResponseId: local?.lastResponseId,
              conversationId: local?.conversationId,
              isShared: local?.isShared,
            };
          });
          set({ sessions: merged, dashboardAvailable: true });
        } catch {
          set({ dashboardAvailable: false });
        } finally {
          set({ isLoading: false });
        }
      },
      setDashboardAvailable: (v) => set({ dashboardAvailable: v }),
    }),
    { name: 'hermes-sessions' }
  )
);


