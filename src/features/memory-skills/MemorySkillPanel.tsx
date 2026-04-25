import { useEffect, useState } from 'react';
import { Brain, Plus, Trash2, Tag, ChevronDown, ChevronRight, X, RefreshCw, Server, WifiOff } from 'lucide-react';
import { useMemorySkillStore } from './store';
import { cn } from '@/lib/cn';
import { checkDashboardHealth } from '@/lib/dashboard-connection';

// ============================================================
// MemoryPanel
// ============================================================
export function MemoryPanel() {
  const memories = useMemorySkillStore((s) => s.memories);
  const addMemory = useMemorySkillStore((s) => s.addMemory);
  const deleteMemory = useMemorySkillStore((s) => s.deleteMemory);
  const updateMemory = useMemorySkillStore((s) => s.updateMemory);
  const [creating, setCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!draftTitle.trim() || !draftContent.trim()) return;
    addMemory({
      title: draftTitle.trim(),
      content: draftContent.trim(),
      tags: draftTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setDraftTitle('');
    setDraftContent('');
    setDraftTags('');
    setCreating(false);
  };

  return (
    <div className="text-xs space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-dark-text-secondary font-medium flex items-center gap-1.5">
          <Brain size={13} />
          记忆条目
        </p>
        <button
          onClick={() => setCreating(true)}
          className="text-2xs text-accent-blue hover:underline flex items-center gap-0.5"
        >
          <Plus size={11} /> 新建
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-md border border-accent-blue/30 bg-accent-blue/5 p-2.5 space-y-2">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="标题"
            className="w-full px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="内容"
            rows={3}
            className="w-full px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary resize-none"
          />
          <input
            value={draftTags}
            onChange={(e) => setDraftTags(e.target.value)}
            placeholder="标签（逗号分隔）"
            className="w-full px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setCreating(false)}
              className="px-2.5 py-1 rounded text-2xs text-dark-text-tertiary hover:text-dark-text-primary transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={!draftTitle.trim() || !draftContent.trim()}
              className="px-2.5 py-1 rounded text-2xs bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 disabled:opacity-30 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {memories.length === 0 && !creating && (
        <p className="text-dark-text-tertiary">暂无记忆条目</p>
      )}
      {memories.map((mem) => {
        const expanded = expandedId === mem.id;
        return (
          <div key={mem.id} className="rounded-md border border-dark-border-default overflow-hidden">
            <button
              onClick={() => setExpandedId(expanded ? null : mem.id)}
              className="flex items-center gap-1.5 w-full px-2.5 py-2 text-left hover:bg-dark-bg-tertiary transition-colors"
            >
              {expanded ? <ChevronDown size={12} className="text-dark-text-tertiary shrink-0" /> : <ChevronRight size={12} className="text-dark-text-tertiary shrink-0" />}
              <span className="truncate text-dark-text-primary flex-1">{mem.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMemory(mem.id); }}
                className="p-0.5 rounded hover:bg-accent-red/15 text-dark-text-tertiary hover:text-accent-red transition-colors shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </button>

            {expanded && (
              <div className="px-2.5 pb-2.5 border-t border-dark-border-subtle">
                <p className="mt-2 text-dark-text-secondary whitespace-pre-wrap">{mem.content}</p>
                {mem.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <Tag size={10} className="text-dark-text-tertiary" />
                    {mem.tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-dark-bg-tertiary text-2xs text-dark-text-tertiary">{t}</span>
                    ))}
                  </div>
                )}
                <p className="text-2xs text-dark-text-tertiary mt-2">
                  创建: {new Date(mem.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SkillPanel
// ============================================================
export function SkillPanel() {
  const skills = useMemorySkillStore((s) => s.skills);
  const dashboardAvailable = useMemorySkillStore((s) => s.dashboardAvailable);
  const dashboardLoading = useMemorySkillStore((s) => s.dashboardLoading);
  const installSkill = useMemorySkillStore((s) => s.installSkill);
  const uninstallSkill = useMemorySkillStore((s) => s.uninstallSkill);
  const fetchDashboardSkills = useMemorySkillStore((s) => s.fetchDashboardSkills);
  const toggleSkillOnDashboard = useMemorySkillStore((s) => s.toggleSkillOnDashboard);
  const [installing, setInstalling] = useState(false);
  const [skillName, setSkillName] = useState('');

  // Auto-check dashboard on mount
  useEffect(() => {
    checkDashboardHealth().then((status) => {
      if (status.connected) {
        fetchDashboardSkills();
      }
    });
  }, [fetchDashboardSkills]);

  const handleToggle = async (name: string, currentlyInstalled: boolean) => {
    if (dashboardAvailable) {
      await toggleSkillOnDashboard(name, !currentlyInstalled);
    } else if (currentlyInstalled) {
      uninstallSkill(name);
    } else {
      installSkill({ name, description: '自定义技能', version: '0.1.0', source: 'custom' });
    }
  };

  const handleInstall = () => {
    if (!skillName.trim()) return;
    installSkill({
      name: skillName.trim(),
      description: '自定义技能',
      version: '0.1.0',
      source: 'custom',
    });
    setSkillName('');
    setInstalling(false);
  };

  const installed = skills.filter((s) => s.isInstalled);
  const available = skills.filter((s) => !s.isInstalled);

  return (
    <div className="text-xs space-y-3 mt-4">
      {/* Dashboard status */}
      <div className="flex items-center justify-between">
        <p className="text-dark-text-secondary font-medium flex items-center gap-1.5">
          已安装技能
        </p>
        <div className="flex items-center gap-1.5">
          {dashboardAvailable ? (
            <span className="flex items-center gap-1 text-2xs text-accent-green">
              <Server size={10} />
              Dashboard
            </span>
          ) : (
            <span className="flex items-center gap-1 text-2xs text-dark-text-tertiary" title="Web Dashboard 未连接，技能数据来自本地存储">
              <WifiOff size={10} />
              离线
            </span>
          )}
          <button
            onClick={() => {
              checkDashboardHealth().then((s) => {
                if (s.connected) fetchDashboardSkills();
              });
            }}
            disabled={dashboardLoading}
            className="text-2xs text-accent-blue hover:underline flex items-center gap-0.5 disabled:opacity-30"
            title="刷新"
          >
            <RefreshCw size={11} className={cn(dashboardLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setInstalling(true)}
            className="text-2xs text-accent-blue hover:underline flex items-center gap-0.5"
          >
            <Plus size={11} /> 安装
          </button>
        </div>
      </div>

      {dashboardLoading && (
        <div className="flex items-center gap-1.5 text-2xs text-dark-text-tertiary">
          <RefreshCw size={11} className="animate-spin" />
          从 Dashboard 加载技能...
        </div>
      )}

      {installing && (
        <div className="rounded-md border border-accent-blue/30 bg-accent-blue/5 p-2.5 flex items-center gap-2">
          <input
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInstall(); }}
            placeholder="技能名称或 agentskills.io URL"
            className="flex-1 px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <button onClick={handleInstall} disabled={!skillName.trim()} className="px-2 py-1 rounded text-2xs bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 disabled:opacity-30 transition-colors">安装</button>
          <button onClick={() => setInstalling(false)} className="p-0.5 text-dark-text-tertiary hover:text-dark-text-primary"><X size={12} /></button>
        </div>
      )}

      {!dashboardLoading && installed.length === 0 && <p className="text-dark-text-tertiary">暂无已安装技能</p>}

      {installed.map((sk) => (
        <div key={sk.name} className="rounded-md border border-dark-border-default px-2.5 py-2">
          <div className="flex items-center justify-between">
            <span className="text-dark-text-primary font-medium">{sk.name}</span>
            <div className="flex items-center gap-1">
              {sk.isRunning ? (
                <button
                  onClick={() => handleToggle(sk.name, true)}
                  className="px-2 py-0.5 rounded text-2xs bg-accent-red/15 text-accent-red hover:bg-accent-red/25 transition-colors"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={() => handleToggle(sk.name, true)}
                  className="px-2 py-0.5 rounded text-2xs bg-accent-green/15 text-accent-green hover:bg-accent-green/25 transition-colors"
                >
                  运行
                </button>
              )}
              <button
                onClick={() => handleToggle(sk.name, true)}
                className="p-0.5 rounded hover:bg-accent-red/15 text-dark-text-tertiary hover:text-accent-red transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
          <p className="text-2xs text-dark-text-tertiary mt-0.5">{sk.description}</p>
          <div className="flex items-center gap-2 mt-1 text-2xs text-dark-text-tertiary">
            <span>v{sk.version}</span>
            <span className="px-1 rounded bg-dark-bg-tertiary">{sk.source}</span>
            {sk.isRunning && <span className="text-accent-green">● 运行中</span>}
          </div>
        </div>
      ))}

      <p className="text-dark-text-secondary font-medium mt-2">可安装</p>
      {available.length === 0 && !dashboardLoading && (
        <p className="text-dark-text-tertiary">没有可安装的技能</p>
      )}
      {available.map((sk) => (
        <div key={sk.name} className="rounded-md border border-dark-border-default border-dashed px-2.5 py-2">
          <div className="flex items-center justify-between">
            <span className="text-dark-text-primary">{sk.name}</span>
            <button
              onClick={() => handleToggle(sk.name, false)}
              className="px-2 py-0.5 rounded text-2xs bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 transition-colors"
            >
              安装
            </button>
          </div>
          <p className="text-2xs text-dark-text-tertiary mt-0.5">{sk.description}</p>
        </div>
      ))}
    </div>
  );
}
