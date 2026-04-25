import { useState } from 'react';
import { FileText, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================================
// Tabs
// ============================================================
type EditorTab = 'soul' | 'context' | 'agents';

const EDITOR_TABS: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
  { id: 'soul',    label: 'SOUL.md',     icon: <FileText size={13} /> },
  { id: 'context', label: 'Context Files', icon: <FileText size={13} /> },
  { id: 'agents',  label: 'AGENTS.md',    icon: <FileText size={13} /> },
];

const STORAGE_KEY = 'hermes-soul-context';

function loadContent(): Record<EditorTab, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<EditorTab, string>;
  } catch { /* ignore */ }
  return { ...DEFAULT_CONTENT };
}

function saveContent(contents: Record<EditorTab, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
  } catch { /* ignore */ }
}

const DEFAULT_CONTENT: Record<EditorTab, string> = {
  soul: `# SOUL.md — 全局人格

你是一个名为 Hermes 的 AI 助手。你的核心特质：

- **专业且友好**：以简洁专业的语气回答，保持亲和力
- **主动思考**：在执行操作前分析可能的影响
- **安全优先**：涉及危险操作时主动提醒并请求确认
- **中文优先**：默认使用中文交流，代码和标识符保持英文

## 行为准则
1. 不执行未经用户确认的危险操作
2. 代码修改前说明意图
3. 出错时提供修复建议而非仅报告错误
4. 保持对话上下文连贯
`,
  context: `# Context Files — 项目上下文

## 项目信息
- **项目名称**: Hermes Agent WebUI
- **技术栈**: React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**: Zustand
- **UI 组件**: shadcn/ui + Radix UI

## 目录结构
- src/app/ — 应用壳、路由、全局 Provider
- src/features/ — 按功能划分的模块
- src/lib/ — 工具函数、API 客户端、类型
- src/ui/ — 通用 UI 组件
- src/i18n/ — 国际化

## 约定
- 组件使用函数组件 + 箭头函数
- 样式使用 Tailwind CSS，不写自定义 CSS
- API 调用封装在 features/*/api.ts 中
`,
  agents: `# AGENTS.md — 代理约定

## 代码规范
- 使用 strict TypeScript
- 组件文件名 PascalCase
- 工具函数文件名 camelCase
- Store 文件名 store.ts

## Git 规范
- feat: 新功能
- fix: 修复
- refactor: 重构
- style: 样式调整（不影响逻辑）
- docs: 文档

## 测试策略
- 关键交互使用组件测试
- API 层使用 mock 测试
- E2E 覆盖核心用户流程
`,
};

// ============================================================
// Component
// ============================================================
export function SoulContextEditor() {
  const [tab, setTab] = useState<EditorTab>('soul');
  const [contents, setContents] = useState<Record<EditorTab, string>>(loadContent);
  const [dirty, setDirty] = useState<Record<EditorTab, boolean>>({ soul: false, context: false, agents: false });

  const handleChange = (val: string) => {
    setContents((prev) => ({ ...prev, [tab]: val }));
    setDirty((prev) => ({ ...prev, [tab]: true }));
  };

  const handleSave = () => {
    saveContent(contents);
    setDirty((prev) => ({ ...prev, [tab]: false }));
  };

  const handleReset = () => {
    setContents((prev) => ({ ...prev, [tab]: DEFAULT_CONTENT[tab] }));
    setDirty((prev) => ({ ...prev, [tab]: false }));
  };

  const lineCount = contents[tab].split('\n').length;

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Tab bar */}
      <div className="flex items-center border-b border-dark-border-subtle shrink-0">
        {EDITOR_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-accent-blue text-dark-text-primary'
                : 'border-transparent text-dark-text-tertiary hover:text-dark-text-secondary'
            )}
          >
            {t.icon}
            {t.label}
            {dirty[t.id] && <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 px-2">
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary hover:text-dark-text-primary transition-colors"
            title="重置"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty[tab]}
            className={cn(
              'p-1 rounded transition-colors',
              dirty[tab]
                ? 'text-accent-blue hover:bg-accent-blue/15'
                : 'text-dark-text-tertiary cursor-not-allowed'
            )}
            title="保存"
          >
            <Save size={12} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full">
          {/* Line numbers */}
          <div className="py-2 pr-2 pl-2 text-right select-none overflow-hidden text-dark-text-tertiary font-mono text-2xs leading-5 border-r border-dark-border-subtle">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={contents[tab]}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 p-2 bg-transparent outline-none resize-none font-mono text-xs leading-5 text-dark-text-primary"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-dark-border-subtle text-2xs text-dark-text-tertiary shrink-0">
        <span>{EDITOR_TABS.find((t) => t.id === tab)?.label}</span>
        <span>{lineCount} 行</span>
      </div>
    </div>
  );
}
