// ============================================================
// 会话
// ============================================================

export interface Session {
  id: string;
  title: string;
  status: 'running' | 'completed' | 'error' | 'pending_approval';
  parentId?: string;
  /** Hermes conversation_id，用于多轮对话 */
  conversationId?: string;
  /** 最近一次 response id，用于下一轮对话的 previous_response_id */
  lastResponseId?: string;
  createdAt: string;
  updatedAt: string;
  modelId?: string;
  isShared?: boolean;
}

export interface SessionForkNode {
  id: string;
  title: string;
  parentId: string;
  children: SessionForkNode[];
}

// ============================================================
// 消息
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: MessageContent[];
  createdAt: string;
  isStreaming?: boolean;
}

export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'code'; language: string; code: string; fileName?: string }
  | { type: 'tool_call'; toolName: string; args: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; result: string }
  | { type: 'permission_request'; permission: PermissionRequest }
  | { type: 'error'; message: string };

// ============================================================
// 权限
// ============================================================

export interface PermissionRequest {
  id: string;
  name: string;
  summary: string;
  args: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high';
  rememberable: boolean;
}

// ============================================================
// 文件
// ============================================================

export interface FileEntry {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: string;
  children?: FileEntry[];
}

// ============================================================
// 工具 / MCP
// ============================================================

export interface ToolInfo {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  isAvailable: boolean;
}

export interface McpServer {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
  resources: string[];
}

// ============================================================
// 记忆 / 技能 (Hermes)
// ============================================================

export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillInfo {
  name: string;
  description: string;
  version: string;
  source: 'local' | 'agentskills.io' | 'custom';
  isInstalled: boolean;
  isRunning?: boolean;
}

// ============================================================
// 主题
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system';
