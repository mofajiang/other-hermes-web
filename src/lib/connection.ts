import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

interface ConnectionStore {
  status: ConnectionStatus;
  baseUrl: string;
  apiKey: string;
  lastError: string | null;
  setConnected: (baseUrl: string, apiKey?: string) => void;
  setDisconnected: (error?: string) => void;
  setChecking: () => void;
  setApiKey: (key: string) => void;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set) => ({
      status: 'checking',
      baseUrl: '',
      apiKey: '',
      lastError: null,
      setConnected: (baseUrl, apiKey) => set({ status: 'connected', baseUrl, apiKey: apiKey || '', lastError: null }),
      setDisconnected: (error) => set({ status: 'disconnected', baseUrl: '', apiKey: '', lastError: error || null }),
      setChecking: () => set({ status: 'checking', lastError: null }),
      setApiKey: (key) => set({ apiKey: key }),
    }),
    {
      name: 'hermes-connection',
      partialize: (state) => ({ apiKey: state.apiKey }),
    }
  )
);

/** 检测 Hermes API Server 是否可用 — 尝试 /health 和 /v1/models */
export async function checkHermesHealth(): Promise<{ ok: boolean; url: string; apiKey?: string; error?: string }> {
  const storedApiKey = useConnectionStore.getState().apiKey || '';
  const candidates: { url: string; apiKey: string }[] = [
    { url: '/api', apiKey: storedApiKey },        // 走 vite proxy → localhost:8642（开发环境推荐）
    { url: 'http://localhost:8642', apiKey: storedApiKey },       // Hermes API Server 直连（生产同源部署）
  ];

  for (const { url, apiKey } of candidates) {
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      // Try /health first (more specific)
      const healthRes = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(3000),
        headers,
      });
      if (healthRes.ok) {
        return { ok: true, url, apiKey };
      }

      // Fallback to /v1/models
      const modelsRes = await fetch(`${url}/v1/models`, {
        signal: AbortSignal.timeout(3000),
        headers,
      });
      if (modelsRes.ok) {
        return { ok: true, url, apiKey };
      }
    } catch {
      // try next
    }
  }

  return { ok: false, url: '', error: '无法连接到 Hermes 后端' };
}

type HealthResult = { ok: boolean; url: string; apiKey?: string; error?: string };

let _initPromise: Promise<HealthResult> | null = null;

/** 初始化连接检测（全局只跑一次） */
export function initConnection(): Promise<HealthResult> {
  if (_initPromise) return _initPromise;

  const store = useConnectionStore.getState();
  store.setChecking();

  const promise = checkHermesHealth().then((result) => {
    if (result.ok) {
      store.setConnected(result.url, result.apiKey);
    } else {
      store.setDisconnected(result.error);
    }
    return result as HealthResult;
  });

  _initPromise = promise;
  return promise;
}
