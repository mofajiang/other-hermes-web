/**
 * BFF (Backend-For-Frontend) 聚合层
 *
 * 职责：
 * 1. 统一代理 Hermes 后端 API（HTTP + SSE）
 * 2. 聚合多个后端接口为前端友好的数据结构
 * 3. 处理鉴权、限流、错误转换
 *
 * 实现方案：Vite dev server proxy（开发）+ 独立 BFF 服务（生产）
 *
 * 生产部署建议：
 *   - 使用 Fastify/Express 创建独立 BFF 服务
 *   - 将 vite.config.ts 中的 proxy 规则迁移到 BFF 路由
 *   - 在 BFF 层聚合 /session、/memory、/skills 等端点
 *   - BFF 监听 3000 端口，前端静态资源由同一服务器托管
 */

// ============================================================
// API 聚合示例 — 在 BFF 层合并多个后端调用
// ============================================================

/**
 * 会话详情页数据聚合
 * 前端只需一次请求即可获取会话 + 消息 + 权限 + diff
 *
 * BFF 路由: GET /api/session/:id/full
 *
 * async function getSessionFull(id: string) {
 *   const [session, messages, permissions, diffs] = await Promise.all([
 *     fetch(`${HERMES_URL}/session/${id}`),
 *     fetch(`${HERMES_URL}/session/${id}/messages`),
 *     fetch(`${HERMES_URL}/session/${id}/permissions`),
 *     fetch(`${HERMES_URL}/session/${id}/diff`),
 *   ]);
 *   return { session, messages, permissions, diffs };
 * }
 */

/**
 * 侧边栏数据聚合
 * 一次获取会话列表 + 全局健康状态
 *
 * BFF 路由: GET /api/sidebar
 *
 * async function getSidebarData() {
 *   const [sessions, health] = await Promise.all([
 *     fetch(`${HERMES_URL}/session`),
 *     fetch(`${HERMES_URL}/global/health`),
 *   ]);
 *   return { sessions, health };
 * }
 */

/**
 * 右面板数据聚合
 * 一次获取工具 + MCP + 记忆 + 技能
 *
 * BFF 路由: GET /api/panel/tools
 *
 * async function getToolsPanel() {
 *   const [tools, mcp, memories, skills] = await Promise.all([
 *     fetch(`${HERMES_URL}/experimental/tool`),
 *     fetch(`${HERMES_URL}/mcp`),
 *     fetch(`${HERMES_URL}/memory`),
 *     fetch(`${HERMES_URL}/skills`),
 *   ]);
 *   return { tools, mcp, memories, skills };
 * }
 */

// ============================================================
// SSE 代理示例
// ============================================================

/**
 * SSE 流式代理 — 将 Hermes 的 SSE 流转发给前端
 *
 * BFF 路由: POST /api/session/:id/prompt
 *
 * async function proxySSE(req, reply) {
 *   const upstream = await fetch(`${HERMES_URL}/session/${req.params.id}/prompt`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(req.body),
 *   });
 *
 *   reply.raw.writeHead(200, {
 *     'Content-Type': 'text/event-stream',
 *     'Cache-Control': 'no-cache',
 *     'Connection': 'keep-alive',
 *   });
 *
 *   const reader = upstream.body.getReader();
 *   const decoder = new TextDecoder();
 *
 *   while (true) {
 *     const { done, value } = await reader.read();
 *     if (done) break;
 *     reply.raw.write(decoder.decode(value, { stream: true }));
 *   }
 *
 *   reply.raw.end();
 * }
 */

// ============================================================
// 环境变量
// ============================================================

export const BFF_CONFIG = {
  /** Hermes 后端地址 */
  hermesUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8642',
  /** BFF 代理前缀 */
  proxyPrefix: '/api',
  /** SSE 心跳间隔 (ms) */
  sseHeartbeat: 15000,
  /** 请求超时 (ms) */
  requestTimeout: 30000,
};
