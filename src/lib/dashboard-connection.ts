/** Web Dashboard API 基础路径（开发环境走 Vite proxy，生产环境同源部署） */
const DASHBOARD_BASE = '/dashboard';

export interface DashboardStatus {
  connected: boolean;
  error?: string;
}

let _cachedStatus: DashboardStatus | null = null;

/** 检测 Web Dashboard 是否可用 */
export async function checkDashboardHealth(): Promise<DashboardStatus> {
  try {
    const res = await fetch(`${DASHBOARD_BASE}/api/status`, {
      signal: AbortSignal.timeout(3000),
    });
    const ok = res.ok;
    _cachedStatus = ok ? { connected: true } : { connected: false, error: `HTTP ${res.status}` };
    return _cachedStatus;
  } catch (err) {
    const error = err instanceof Error ? err.message : '连接失败';
    _cachedStatus = { connected: false, error };
    return _cachedStatus;
  }
}

/** 获取缓存的 Dashboard 状态（避免重复请求） */
export function getCachedDashboardStatus(): DashboardStatus | null {
  return _cachedStatus;
}

// ============================================================
// API 调用
// ============================================================

export interface DashboardSkill {
  name: string;
  description: string;
  version: string;
  source: string;
  installed: boolean;
  running?: boolean;
}

export interface DashboardSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  model_id?: string;
}

/** 获取技能列表 */
export async function fetchSkills(): Promise<DashboardSkill[]> {
  const res = await fetch(`${DASHBOARD_BASE}/api/skills`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`获取技能列表失败: HTTP ${res.status}`);
  return res.json();
}

/** 切换技能启用状态 */
export async function toggleSkill(skillName: string, enabled: boolean): Promise<void> {
  const res = await fetch(`${DASHBOARD_BASE}/api/skills/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: skillName, enabled }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`切换技能状态失败: HTTP ${res.status}`);
}

/** 获取会话列表 */
export async function fetchSessions(): Promise<DashboardSession[]> {
  const res = await fetch(`${DASHBOARD_BASE}/api/sessions`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`获取会话列表失败: HTTP ${res.status}`);
  return res.json();
}

/** 搜索会话 */
export async function searchSessions(query: string): Promise<DashboardSession[]> {
  const res = await fetch(`${DASHBOARD_BASE}/api/sessions/search?q=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`搜索会话失败: HTTP ${res.status}`);
  return res.json();
}
