import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelTabId = 'files' | 'diff' | 'tools' | 'memory' | 'soul' | 'meta';

export interface PanelTabConfig {
  id: PanelTabId;
  label: string;
  enabled: boolean;
  order: number;
}

interface PanelConfigState {
  tabs: PanelTabConfig[];
  toggleTab: (id: PanelTabId) => void;
  setTabOrder: (tabs: PanelTabConfig[]) => void;
  resetToDefault: () => void;
}

const DEFAULT_TABS: PanelTabConfig[] = [
  { id: 'files',  label: '文件',     enabled: true, order: 0 },
  { id: 'diff',   label: '差异',     enabled: true, order: 1 },
  { id: 'tools',  label: '工具/MCP', enabled: true, order: 2 },
  { id: 'memory', label: '记忆/技能', enabled: true, order: 3 },
  { id: 'soul',   label: 'SOUL',     enabled: true, order: 4 },
  { id: 'meta',   label: '属性',     enabled: true, order: 5 },
];

export const usePanelConfigStore = create<PanelConfigState>()(
  persist(
    (set) => ({
      tabs: DEFAULT_TABS,
      toggleTab: (id) =>
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === id ? { ...t, enabled: !t.enabled } : t
          ),
        })),
      setTabOrder: (tabs) => set({ tabs }),
      resetToDefault: () => set({ tabs: DEFAULT_TABS }),
    }),
    { name: 'hermes-panel-config' }
  )
);
