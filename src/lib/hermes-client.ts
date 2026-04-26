import { useConnectionStore } from './connection';
import type { Session } from './types';

// ============================================================
// Hermes Agent API Client
// 基于 OpenAI 兼容 API 格式（/v1/chat/completions, /v1/responses）
// 文档：https://hermesagent.org.cn/docs/user-guide/features/api-server
// ============================================================

function getBaseUrl(): string {
  const { status, baseUrl } = useConnectionStore.getState();
  if (status === 'connected' && baseUrl) return baseUrl;
  return '/api'; // vite proxy fallback
}

function getApiKey(): string {
  return useConnectionStore.getState().apiKey || '';
}

function authHeaders(): Record<string, string> {
  const key = getApiKey();
  return key ? { Authorization: `Bearer ${key}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text() as unknown as T;
}

// ============================================================
// Models
// ============================================================

export interface ModelInfo {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

export const modelsApi = {
  list: () => request<{ object: string; data: ModelInfo[] }>('/v1/models'),
};

// ============================================================
// Chat Completions 类型（用于 Responses API input）
// ============================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

// ============================================================
// Responses API
// POST /v1/responses
// ============================================================

export interface ResponseRequest {
  model?: string;
  input: string | ChatMessage[];
  stream?: boolean;
  /** 命名对话 — Hermes 用此标识会话 */
  conversation_id?: string;
  previous_response_id?: string;
}

export interface HermesResponse {
  id: string;
  object: string;
  model: string;
  output: { type: string; text: string }[];
  status: string;
  created_at: number;
}

export const responsesApi = {
  /** 创建 Response（非流式） */
  create: (req: ResponseRequest) =>
    request<HermesResponse>('/v1/responses', {
      method: 'POST',
      body: JSON.stringify({ ...req, stream: false }),
    }),

  /** 构建流式请求 */
  streamRequest: (req: ResponseRequest) => ({
    url: `${getBaseUrl()}/v1/responses`,
    body: JSON.stringify({ ...req, stream: true }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  }),

  /** 获取已有 Response */
  get: (id: string) => request<HermesResponse>(`/v1/responses/${id}`),

  /** 删除 Response */
  delete: (id: string) => request<void>(`/v1/responses/${id}`, { method: 'DELETE' }),
};

// ============================================================
// Chat Completions API
// POST /v1/chat/completions
// 轻量级替代 Responses API，用于无状态对话
// ============================================================

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const chatApi = {
  /** 非流式请求 */
  create: (req: ChatCompletionRequest) =>
    request<ChatCompletionResponse>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ ...req, stream: false }),
    }),

  /** 构建流式请求参数 */
  streamRequest: (req: ChatCompletionRequest) => ({
    url: `${getBaseUrl()}/v1/chat/completions`,
    body: JSON.stringify({ ...req, stream: true }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  }),
};

// ============================================================
// 会话管理 — Hermes 通过 /v1/responses + conversation_id 管理多轮对话
// 前端侧维护本地会话列表（lastResponseId 链式追踪）
// ============================================================

export interface LocalSession extends Session {
  /** 最后一个 response ID，用于多轮对话连续性 */
  lastResponseId?: string;
  /** 对话 ID，用于 Hermes conversation_id */
  conversationId?: string;
}

export const sessionApi = {
  /** 列表由前端本地维护，不调用后端 */
  list: () => [] as LocalSession[],

  /** 创建新会话 — 发送第一条消息时自动创建 */
  create: (title?: string): LocalSession => ({
    id: crypto.randomUUID(),
    title: title || '新会话',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isShared: false,
    conversationId: crypto.randomUUID(),
  }),

  /** 中止 — 关闭 SSE 连接即可，无后端 abort 端点 */
  abort: () => { /* 由前端 SSE AbortController 处理 */ },
};
