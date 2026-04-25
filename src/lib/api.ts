// API 端点映射 — 基于 Hermes Agent OpenAI 兼容 API
// 文档：https://hermesagent.org.cn/docs/user-guide/features/api-server
// 默认端口：8642（由 Vite proxy /api → localhost:8642）

const BASE = '/api';

const api = {
  // OpenAI 兼容端点
  v1: {
    chatCompletions: () => `${BASE}/v1/chat/completions`,
    responses:       () => `${BASE}/v1/responses`,
    response:        (id: string) => `${BASE}/v1/responses/${id}`,
    models:          () => `${BASE}/v1/models`,
  },
  // 以下端点为 Hermes 未来可能暴露的管理 API（预留）
  session: {
    create:      ()                       => `${BASE}/session`,
    delete:      (id: string)             => `${BASE}/session/${id}`,
  },
  file: {
    list:    (path?: string) => `${BASE}/file${path ? `?path=${encodeURIComponent(path)}` : ''}`,
    content: (path: string)  => `${BASE}/file/content?path=${encodeURIComponent(path)}`,
    find:    (q: string)     => `${BASE}/find/file?q=${encodeURIComponent(q)}`,
    symbol:  (q: string)     => `${BASE}/find/symbol?q=${encodeURIComponent(q)}`,
  },
  tool: {
    list: () => `${BASE}/experimental/tool`,
  },
  mcp: {
    list: () => `${BASE}/mcp`,
    add:  () => `${BASE}/mcp`,
  },
  memory: {
    list:   ()               => `${BASE}/memory`,
    get:    (id: string)      => `${BASE}/memory/${id}`,
    create: ()               => `${BASE}/memory`,
    delete: (id: string)      => `${BASE}/memory/${id}`,
    merge:  ()               => `${BASE}/memory/merge`,
  },
  skill: {
    list:     ()              => `${BASE}/skills`,
    install:  ()              => `${BASE}/skills/install`,
    run:      (name: string)  => `${BASE}/skills/${name}/run`,
    uninstall:(name: string)  => `${BASE}/skills/${name}`,
  },
  global: {
    health: () => `${BASE}/v1/models`, // 用 /v1/models 做健康检查
    event:  () => `${BASE}/global/event`,
  },
  config: {
    get: () => `${BASE}/config`,
  },
};

export { api };
