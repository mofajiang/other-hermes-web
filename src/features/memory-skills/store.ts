import { create } from 'zustand';
import type { MemoryEntry, SkillInfo } from '@/lib/types';
import { fetchSkills as fetchDashboardSkillsApi, toggleSkill as toggleSkillApi } from '@/lib/dashboard-connection';
import type { DashboardSkill } from '@/lib/dashboard-connection';

const STORAGE_KEY = 'hermes-memory-skills';

function loadFromStorage(): { memories: MemoryEntry[]; skills: SkillInfo[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  return {
    memories: [],
    skills: [],
  };
}

function saveToStorage(memories: MemoryEntry[], skills: SkillInfo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ memories, skills }));
  } catch { /* ignore */ }
}

function dashboardSkillToSkillInfo(ds: DashboardSkill): SkillInfo {
  return {
    name: ds.name,
    description: ds.description || '',
    version: ds.version || '0.0.0',
    source: (ds.source as SkillInfo['source']) || 'custom',
    isInstalled: ds.installed,
    isRunning: ds.running,
  };
}

interface MemorySkillStore {
  memories: MemoryEntry[];
  skills: SkillInfo[];
  dashboardAvailable: boolean;
  dashboardLoading: boolean;
  // Memory
  addMemory: (entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, patch: Partial<Pick<MemoryEntry, 'title' | 'content' | 'tags'>>) => void;
  // Skill
  installSkill: (skill: Omit<SkillInfo, 'isInstalled'>) => void;
  uninstallSkill: (name: string) => void;
  setSkillRunning: (name: string, running: boolean) => void;
  // Dashboard
  setDashboardAvailable: (v: boolean) => void;
  fetchDashboardSkills: () => Promise<void>;
  toggleSkillOnDashboard: (name: string, enabled: boolean) => Promise<void>;
}

const initial = loadFromStorage();

export const useMemorySkillStore = create<MemorySkillStore>((set, get) => ({
  memories: initial.memories,
  skills: initial.skills,
  dashboardAvailable: false,
  dashboardLoading: false,

  addMemory: (entry) =>
    set((s) => {
      const memories = [
        { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...s.memories,
      ];
      saveToStorage(memories, s.skills);
      return { memories };
    }),

  deleteMemory: (id) =>
    set((s) => {
      const memories = s.memories.filter((m) => m.id !== id);
      saveToStorage(memories, s.skills);
      return { memories };
    }),

  updateMemory: (id, patch) =>
    set((s) => {
      const memories = s.memories.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      );
      saveToStorage(memories, s.skills);
      return { memories };
    }),

  installSkill: (skill) =>
    set((s) => {
      const skills = [...s.skills, { ...skill, isInstalled: true }];
      saveToStorage(s.memories, skills);
      return { skills };
    }),

  uninstallSkill: (name) =>
    set((s) => {
      const skills = s.skills.filter((sk) => sk.name !== name);
      saveToStorage(s.memories, skills);
      return { skills };
    }),

  setSkillRunning: (name, running) =>
    set((s) => {
      const skills = s.skills.map((sk) =>
        sk.name === name ? { ...sk, isRunning: running } : sk
      );
      saveToStorage(s.memories, skills);
      return { skills };
    }),

  setDashboardAvailable: (v) => set({ dashboardAvailable: v }),

  fetchDashboardSkills: async () => {
    set({ dashboardLoading: true });
    try {
      const dashboardSkills = await fetchDashboardSkillsApi();
      const skills = dashboardSkills.map(dashboardSkillToSkillInfo);
      saveToStorage(get().memories, skills);
      set({ skills, dashboardAvailable: true });
    } catch {
      set({ dashboardAvailable: false });
    } finally {
      set({ dashboardLoading: false });
    }
  },

  toggleSkillOnDashboard: async (name, enabled) => {
    try {
      await toggleSkillApi(name, enabled);
      // Re-fetch to get latest state
      await get().fetchDashboardSkills();
    } catch (err) {
      console.error('切换技能失败:', err);
    }
  },
}));
