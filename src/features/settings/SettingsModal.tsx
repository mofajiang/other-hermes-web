import { useState } from 'react';
import { PanelSettings } from './PanelSettings';
import { X, Monitor, Palette, Keyboard, Plug, FileText, Bell, Layout } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useThemeStore } from '@/app/theme/store';
import type { ThemeMode } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'appearance' | 'shortcuts' | 'mcp' | 'files' | 'notifications' | 'panels';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general',       label: '通用',     icon: <Monitor size={14} /> },
  { id: 'appearance',    label: '外观',     icon: <Palette size={14} /> },
  { id: 'shortcuts',     label: '快捷键',   icon: <Keyboard size={14} /> },
  { id: 'mcp',           label: 'MCP',      icon: <Plug size={14} /> },
  { id: 'files',         label: '文件',     icon: <FileText size={14} /> },
  { id: 'notifications', label: '通知',     icon: <Bell size={14} /> },
  { id: 'panels',        label: '面板',     icon: <Layout size={14} /> },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>('general');
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-[70vh] rounded-xl border border-dark-border-default bg-dark-bg-secondary shadow-modal animate-fade-in flex overflow-hidden">
        {/* Left tabs */}
        <nav className="w-44 border-r border-dark-border-subtle p-2 space-y-0.5 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md transition-colors',
                tab === t.id
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border-subtle shrink-0">
            <h2 className="text-sm font-medium text-dark-text-primary">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'general' && <GeneralSettings />}
            {tab === 'appearance' && <AppearanceSettings mode={themeMode} setMode={setThemeMode} />}
            {tab === 'shortcuts' && <ShortcutsSettings />}
            {tab === 'mcp' && <McpSettings />}
            {tab === 'files' && <FilesSettings />}
            {tab === 'notifications' && <NotificationSettings />}
            {tab === 'panels' && <PanelSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab content
// ============================================================

function GeneralSettings() {
  return (
    <div className="space-y-4 text-xs">
      <SettingRow label="默认模型" description="新会话默认使用的 AI 模型">
        <select className="px-2 py-1.5 rounded-md bg-dark-bg-tertiary border border-dark-border-default text-dark-text-primary text-xs outline-none focus:border-accent-blue">
          <option>hermes-3-llama-3.1-405b</option>
          <option>hermes-3-llama-3.1-70b</option>
          <option>hermes-3-llama-3.1-8b</option>
        </select>
      </SettingRow>
      <SettingRow label="默认模式" description="新建会话的初始工作模式">
        <select className="px-2 py-1.5 rounded-md bg-dark-bg-tertiary border border-dark-border-default text-dark-text-primary text-xs outline-none focus:border-accent-blue">
          <option>构建模式</option>
          <option>计划模式</option>
        </select>
      </SettingRow>
      <SettingRow label="语言" description="界面显示语言">
        <select className="px-2 py-1.5 rounded-md bg-dark-bg-tertiary border border-dark-border-default text-dark-text-primary text-xs outline-none focus:border-accent-blue">
          <option>中文</option>
          <option>English</option>
        </select>
      </SettingRow>
    </div>
  );
}

function AppearanceSettings({ mode, setMode }: { mode: ThemeMode; setMode: (m: ThemeMode) => void }) {
  const themes: { value: ThemeMode; label: string; desc: string }[] = [
    { value: 'dark', label: '暗色', desc: '深色背景，护眼舒适' },
    { value: 'light', label: '亮色', desc: '浅色背景，明亮清晰' },
    { value: 'system', label: '跟随系统', desc: '自动匹配操作系统设置' },
  ];

  return (
    <div className="space-y-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setMode(t.value)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors text-left',
            mode === t.value
              ? 'border-accent-blue bg-accent-blue/10'
              : 'border-dark-border-default hover:border-dark-border-subtle'
          )}
        >
          <div className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
            mode === t.value ? 'border-accent-blue' : 'border-dark-text-tertiary'
          )}>
            {mode === t.value && <div className="w-2 h-2 rounded-full bg-accent-blue" />}
          </div>
          <div>
            <p className="text-xs text-dark-text-primary font-medium">{t.label}</p>
            <p className="text-2xs text-dark-text-tertiary">{t.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ShortcutsSettings() {
  const modLabel = navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl';
  const shortcuts = [
    { keys: [modLabel, 'K'], desc: '命令面板' },
    { keys: [modLabel, 'N'], desc: '新建会话' },
    { keys: [modLabel, 'W'], desc: '关闭会话' },
    { keys: [modLabel, 'B'], desc: '侧边栏' },
    { keys: [modLabel, '/'], desc: '右面板' },
    { keys: ['Enter'], desc: '发送消息' },
    { keys: ['Shift', 'Enter'], desc: '换行' },
    { keys: ['/'], desc: '斜杠命令' },
    { keys: ['@'], desc: '文件搜索' },
    { keys: ['Esc'], desc: '关闭弹窗' },
  ];

  return (
    <div className="space-y-1.5 text-xs">
      {shortcuts.map((s) => (
        <div key={s.desc} className="flex items-center justify-between py-1.5">
          <span className="text-dark-text-secondary">{s.desc}</span>
          <div className="flex items-center gap-1">
            {s.keys.map((k, i) => (
              <kbd key={i} className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">{k}</kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function McpSettings() {
  return (
    <div className="text-xs text-dark-text-tertiary space-y-2">
      <p>MCP 服务器配置在此管理。你也可以在右面板的"工具/MCP"标签中操作。</p>
      <p>添加 MCP 服务器时需要提供启动命令和参数。</p>
    </div>
  );
}

function FilesSettings() {
  return (
    <div className="text-xs space-y-4">
      <SettingRow label="默认编辑器" description="文件查看使用的编辑器">
        <select className="px-2 py-1.5 rounded-md bg-dark-bg-tertiary border border-dark-border-default text-dark-text-primary text-xs outline-none focus:border-accent-blue">
          <option>内置编辑器</option>
          <option>VS Code</option>
        </select>
      </SettingRow>
    </div>
  );
}

function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <div className="space-y-4 text-xs">
      <SettingRow label="桌面通知" description="权限审批等关键操作时发送通知">
        <Toggle checked={enabled} onChange={setEnabled} />
      </SettingRow>
      <SettingRow label="提示音" description="收到新消息时播放提示音">
        <Toggle checked={sound} onChange={setSound} />
      </SettingRow>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-dark-text-primary">{label}</p>
        <p className="text-2xs text-dark-text-tertiary mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-9 h-5 rounded-full transition-colors relative',
        checked ? 'bg-accent-blue' : 'bg-dark-bg-elevated'
      )}
      role="switch"
      aria-checked={checked}
    >
      <div className={cn(
        'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform',
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      )} />
    </button>
  );
}
