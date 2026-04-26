/**
 * Hermes Agent 后端配置
 *
 * Hermes 使用 OpenAI 兼容 API 格式
 * 文档：https://hermesagent.org.cn/docs/user-guide/features/api-server
 * 默认端口：8642，通过 API_SERVER_PORT 环境变量修改
 */

export const HERMES_CONFIG = {
  /** 后端候选 URL（健康检查依次尝试） */
  baseUrls: [
    'http://localhost:8642',      // Hermes API Server 默认端口
    'http://localhost:8080',      // 备选
    window.location.origin,       // 同源部署（走 vite proxy）
  ],

  /** API 路径前缀 */
  pathPrefix: '/v1',

  /** 健康检查端点 — GET /v1/models */
  healthEndpoint: '/v1/models',

  /** 鉴权方式: 'none' | 'bearer' */
  authMethod: 'none' as 'none' | 'bearer',

  /** Bearer token（API_SERVER_KEY 设置后填入） */
  authToken: '',

  // ============================================================
  // OpenAI 兼容端点
  // ============================================================
  endpoints: {
    // 核心端点
    chatCompletions: '/v1/chat/completions',
    responses:       '/v1/responses',
    responseGet:     (id: string) => `/v1/responses/${id}`,
    responseDelete:  (id: string) => `/v1/responses/${id}`,
    models:          '/v1/models',

    // 文件（Hermes 通过工具操作，无独立 REST 端点）
    fileList:    '/file',
    fileContent: '/file/content',
    fileFind:    '/find/file',
    symbolFind:  '/find/symbol',

    // 工具 / MCP
    toolList: '/experimental/tool',
    mcpList:  '/mcp',
    mcpAdd:   '/mcp',

    // 记忆 / 技能
    memoryList:   '/memory',
    memoryGet:    (id: string) => `/memory/${id}`,
    memoryCreate: '/memory',
    memoryDelete: (id: string) => `/memory/${id}`,
    skillList:    '/skills',
    skillInstall: '/skills/install',
    skillRun:     (name: string) => `/skills/${name}/run`,

    // 配置
    config: '/config',

    // Health
    health: '/health',
    healthDetailed: '/health/detailed',

    // Runs API
    runs: '/v1/runs',
    runEvents: (id: string) => `/v1/runs/${id}/events`,

    // Jobs API
    jobs: '/api/jobs',
    jobById: (id: string) => `/api/jobs/${id}`,
  },

  // ============================================================
  // SSE 事件映射 — OpenAI Responses API 格式
  // ============================================================
  sseEvents: {
    /** OpenAI chat/completions 格式：data 行默认 event 类型 */
    message: 'message',
    /** 流结束标记 */
    done: 'done',
    /** Responses API 事件 */
    responseCreated:     'response.created',
    responseTextDelta:   'response.output_text.delta',
    responseOutputItemAdded: 'response.output_item.added',
    responseOutputItemDone:  'response.output_item.done',
    responseCompleted:   'response.completed',
    responseFailed:      'response.failed',
    responseToolCall:    'response.tool_call',
  },
};
