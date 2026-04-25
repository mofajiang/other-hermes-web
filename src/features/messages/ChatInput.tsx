import { useState, useRef, useEffect, useMemo, useCallback, type MutableRefObject } from 'react';
import { Send, Square, Paperclip, File, Search, Hash } from 'lucide-react';
import { useMessageStore } from './store';
import { useToastStore, useToast } from '@/ui/toast-store';
import { useConnectionStore } from '@/lib/connection';
import { useSessionStore } from '@/features/sessions/store';
import { cn } from '@/lib/cn';
import type { MessageContent, Session } from '@/lib/types';

// ============================================================
// Slash commands
// ============================================================
const SLASH_COMMANDS = [
  { command: '/prompt_async', description: '异步发送提示词' },
  { command: '/command',      description: '执行命令' },
  { command: '/shell',        description: '执行 Shell 命令', argsHint: '<command>' },
  { command: '/file',         description: '浏览文件' },
  { command: '/file/content', description: '查看文件内容',   argsHint: '<path>' },
  { command: '/find/file',    description: '搜索文件',       argsHint: '<query>' },
  { command: '/find/symbol',  description: '搜索符号',       argsHint: '<query>' },
  { command: '/diff',         description: '查看差异' },
  { command: '/revert',       description: '撤销更改' },
  { command: '/unrevert',     description: '恢复撤销' },
  { command: '/abort',        description: '中止会话' },
  { command: '/share',        description: '分享会话' },
  { command: '/config',       description: '查看配置' },
  { command: '/log',          description: '查看日志' },
  { command: '/mcp',          description: 'MCP 管理' },
  { command: '/help',         description: '帮助' },
];

// ============================================================
// Mock files for @ search — P1 接 API
// ============================================================
const MOCK_FILES = [
  { path: 'src/app/App.tsx',                  type: 'file' as const },
  { path: 'src/app/shell/AppShell.tsx',       type: 'file' as const },
  { path: 'src/app/theme/ThemeProvider.tsx',   type: 'file' as const },
  { path: 'src/app/theme/store.ts',           type: 'file' as const },
  { path: 'src/features/sessions/Sidebar.tsx', type: 'file' as const },
  { path: 'src/features/sessions/TopBar.tsx',  type: 'file' as const },
  { path: 'src/features/messages/ChatPanel.tsx', type: 'file' as const },
  { path: 'src/features/messages/ChatInput.tsx', type: 'file' as const },
  { path: 'src/features/permissions/PermissionCard.tsx', type: 'file' as const },
  { path: 'src/lib/types.ts',                 type: 'file' as const },
  { path: 'src/lib/api.ts',                   type: 'file' as const },
  { path: 'src/lib/sse.ts',                   type: 'file' as const },
  { path: 'package.json',                     type: 'file' as const },
  { path: 'tailwind.config.mjs',              type: 'file' as const },
  { path: 'vite.config.ts',                   type: 'file' as const },
];

const MOCK_SYMBOLS = [
  { path: 'src/lib/types.ts',  name: 'Session',         type: 'interface' as const },
  { path: 'src/lib/types.ts',  name: 'Message',         type: 'interface' as const },
  { path: 'src/lib/types.ts',  name: 'PermissionRequest', type: 'interface' as const },
  { path: 'src/lib/types.ts',  name: 'FileEntry',       type: 'interface' as const },
  { path: 'src/lib/api.ts',    name: 'api',             type: 'const' as const },
  { path: 'src/lib/sse.ts',    name: 'connectSSE',      type: 'function' as const },
  { path: 'src/lib/cn.ts',     name: 'cn',              type: 'function' as const },
];

// ============================================================
// Component
// ============================================================
interface ChatInputProps {
  sessionId: string;
  isStreaming: boolean;
  triggerSendRef?: MutableRefObject<((text: string) => void) | null>;
}

type PopupMode = 'none' | 'slash' | 'mention';

export function ChatInput({ sessionId, isStreaming, triggerSendRef }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [popupMode, setPopupMode] = useState<PopupMode>('none');
  const [popupQuery, setPopupQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const appendMessage = useMessageStore((s) => s.appendMessage);
  const updateMessage = useMessageStore((s) => s.updateMessage);
  const setStreaming = useMessageStore((s) => s.setStreaming);
  const toast = useToast();
  const abortRef = useRef(false);
  const sseAbortRef = useRef<AbortController | null>(null);
  const isConnected = useConnectionStore((s) => s.status === 'connected');

  // ---- Filtered lists ----
  const filteredCommands = useMemo(() =>
    popupQuery
      ? SLASH_COMMANDS.filter((c) =>
          c.command.toLowerCase().includes(popupQuery.toLowerCase()) ||
          c.description.includes(popupQuery)
        )
      : SLASH_COMMANDS,
    [popupQuery]
  );

  const filteredMentions = useMemo(() => {
    const q = popupQuery.toLowerCase();
    if (!q) return [...MOCK_FILES.slice(0, 8), ...MOCK_SYMBOLS.slice(0, 4)];
    const files = MOCK_FILES.filter((f) => f.path.toLowerCase().includes(q));
    const syms = MOCK_SYMBOLS.filter((s) => s.name.toLowerCase().includes(q) || s.path.toLowerCase().includes(q));
    return [...files, ...syms];
  }, [popupQuery]);

  const totalItems = popupMode === 'slash' ? filteredCommands.length : filteredMentions.length;

  // ---- Reset index when list changes ----
  useEffect(() => { setSelectedIndex(0); }, [popupMode, popupQuery]);

  // ---- Detect trigger ----
  const detectPopup = (val: string, cursorPos: number) => {
    const textBefore = val.slice(0, cursorPos);
    // Check / at start
    if (textBefore.startsWith('/') && !textBefore.includes(' ')) {
      setPopupMode('slash');
      setPopupQuery(textBefore.slice(1));
      return;
    }
    // Check @
    const lastAt = textBefore.lastIndexOf('@');
    if (lastAt !== -1) {
      const segment = textBefore.slice(lastAt + 1);
      if (!segment.includes(' ')) {
        setPopupMode('mention');
        setPopupQuery(segment);
        return;
      }
    }
    setPopupMode('none');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    detectPopup(val, e.target.selectionStart);
  };

  // ---- Insert selection ----
  const insertCommand = (cmd: string) => {
    setInput(cmd + ' ');
    setPopupMode('none');
    textareaRef.current?.focus();
  };

  const insertMention = (item: { path: string; name?: string; type?: string }) => {
    const token = item.name
      ? `<symbol:${item.name}>`
      : `<file:${item.path}>`;
    // Replace @query with token
    const lastAt = input.lastIndexOf('@');
    if (lastAt !== -1) {
      setInput(input.slice(0, lastAt) + token + ' ');
    } else {
      setInput(input + token + ' ');
    }
    setPopupMode('none');
    textareaRef.current?.focus();
  };

  // ---- Key handling ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (popupMode !== 'none') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (popupMode === 'slash' && filteredCommands[selectedIndex]) {
          insertCommand(filteredCommands[selectedIndex].command);
        } else if (popupMode === 'mention' && filteredMentions[selectedIndex]) {
          insertMention(filteredMentions[selectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setPopupMode('none');
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    setPopupMode('none');
    doSendText(trimmed);
  };

  // ============================================================
  // 真实 Hermes SSE 发送 — Responses API
  // POST /v1/responses { stream: true }
  // ============================================================
  const sendRealPrompt = useCallback(async (sid: string, msgId: string, userText: string) => {
    const { connectSSE } = await import('@/lib/sse');
    const { responsesApi } = await import('@/lib/hermes-client');

    // 获取会话的 conversationId，构建消息历史
    const sessionStore = useSessionStore.getState();
    const session = sessionStore.sessions.find((s: Session) => s.id === sid);
    const convId = session?.conversationId || session?.id || sid;
    const prevResponseId = session?.lastResponseId;

    // Responses API：支持 conversation_id + previous_response_id 多轮
    const { url, body, headers } = responsesApi.streamRequest({
      input: userText,
      conversation_id: convId,
      previous_response_id: prevResponseId,
      model: session?.modelId,
    } as Parameters<typeof responsesApi.streamRequest>[0]);

    let accumulatedContent: MessageContent[] = [];
    let currentText = '';
    let toolCallAcc = '';
    let capturedResponseId: string | null = null;

    try {
      const controller = await connectSSE({ url, body, headers }, {
        onEvent: (event, data) => {
          // ---- Responses API SSE 格式 ----
          // 文档: https://hermes-agent.nousresearch.com/docs

          // 文本增量
          if (event === 'response.output_text.delta') {
            const delta = (data as { delta?: string }).delta || '';
            currentText += delta;
            const nonText = accumulatedContent.filter((c) => c.type !== 'text');
            accumulatedContent = [...nonText, { type: 'text' as const, text: currentText }];
            updateMessage(sid, msgId, { content: [...accumulatedContent] });
            return;
          }

          // 工具调用开始: output_item.added / item.type === 'function_call'
          if (event === 'response.output_item.added') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = (data as any)?.item;
            if (item?.type === 'function_call') {
              const toolName = item.name || 'tool';
              let toolArgs: Record<string, unknown> = {};
              try {
                toolArgs = JSON.parse(item.arguments || '{}');
              } catch { /* ignore */ }
              accumulatedContent.push({ type: 'tool_call', toolName, args: toolArgs });
              toolCallAcc = item.arguments || '';
              currentText = '';
              updateMessage(sid, msgId, { content: [...accumulatedContent] });
              return;
            }
            // 工具执行结果: item.type === 'function_call_output'
            if (item?.type === 'function_call_output') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const outputParts = item.output as any[];
              const resultText = outputParts
                ?.map((p: { text?: string }) => p.text || '')
                .filter(Boolean)
                .join('\n') || JSON.stringify(item.output || '');
              // 找到上一个 tool_call 的名称
              let toolName = 'tool';
              for (let i = accumulatedContent.length - 1; i >= 0; i--) {
                const c = accumulatedContent[i];
                if (c.type === 'tool_call') { toolName = c.toolName; break; }
              }
              accumulatedContent.push({ type: 'tool_result', toolName, result: resultText });
              updateMessage(sid, msgId, { content: [...accumulatedContent] });
              return;
            }
            return;
          }

          // 工具调用完成: output_item.done / item.type === 'function_call'
          if (event === 'response.output_item.done') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = (data as any)?.item;
            if (item?.type === 'function_call') {
              // 更新 tool_call 的最终参数
              const finalArgs = item.arguments || toolCallAcc;
              for (let i = accumulatedContent.length - 1; i >= 0; i--) {
                const c = accumulatedContent[i];
                if (c.type === 'tool_call') {
                  try { c.args = JSON.parse(finalArgs); } catch { c.args = {}; }
                  break;
                }
              }
              toolCallAcc = '';
              updateMessage(sid, msgId, { content: [...accumulatedContent] });
              return;
            }
            return;
          }

          // 权限请求（Hermes CLI/gateway 使用，API Server 可能不支持）
          if (event === 'response.permission_request' || event === 'request_permission') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const permData = (data as any).permission || data as any;
            const permission: import('@/lib/types').PermissionRequest = {
              id: permData.id || crypto.randomUUID(),
              name: permData.name || permData.tool_name || 'execute_bash',
              summary: permData.summary || permData.description || permData.reason || '执行 Shell 命令',
              args: permData.args || permData.arguments || {},
              riskLevel: permData.riskLevel || permData.risk_level || 'medium',
              rememberable: permData.rememberable ?? true,
            };
            accumulatedContent.push({ type: 'permission_request', permission });
            updateMessage(sid, msgId, { content: [...accumulatedContent] });
            return;
          }

          // 错误
          if (event === 'response.failed') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errMsg = (data as any)?.response?.error?.message || (data as any)?.error?.message || '请求失败';
            accumulatedContent.push({ type: 'error', message: errMsg });
            updateMessage(sid, msgId, { content: [...accumulatedContent] });
            return;
          }

          // 流结束
          if (event === 'response.completed' || event === 'done') {
            capturedResponseId = (data as { response?: { id?: string } })?.response?.id
              || (data as { id?: string })?.id
              || null;
            return;
          }
        },
        onClose: () => {
          updateMessage(sid, msgId, { isStreaming: false });
          setStreaming(false);
          if (capturedResponseId) {
            useSessionStore.getState().updateLastResponseId(sid, capturedResponseId);
          }
        },
        onError: (err) => {
          accumulatedContent.push({ type: 'error', message: err.message });
          updateMessage(sid, msgId, { content: [...accumulatedContent], isStreaming: false });
          setStreaming(false);
          toast.error('连接中断: ' + err.message);
        },
      });

      sseAbortRef.current = controller;
    } catch (err) {
      updateMessage(sid, msgId, {
        content: [{ type: 'error', message: (err as Error).message }],
        isStreaming: false,
      });
      setStreaming(false);
      toast.error('发送失败: ' + (err as Error).message);
    }
  }, [updateMessage, setStreaming, toast]);

  const simulateStream = useCallback((sid: string, msgId: string, userText: string) => {
    const responses = getMockResponse(userText);
    let contentIndex = 0;
    let charIndex = 0;
    let currentText = '';

    const interval = setInterval(() => {
      if (abortRef.current) {
        clearInterval(interval);
        updateMessage(sid, msgId, { isStreaming: false });
        setStreaming(false);
        toast.warning('已中止回复');
        return;
      }

      if (contentIndex >= responses.length) {
        clearInterval(interval);
        updateMessage(sid, msgId, { isStreaming: false });
        setStreaming(false);
        return;
      }

      const block = responses[contentIndex];
      if (block.type === 'text') {
        if (charIndex < block.text.length) {
          currentText += block.text[charIndex];
          charIndex++;
          // Build content so far
          const built = [
            ...responses.slice(0, contentIndex),
            { type: 'text' as const, text: currentText },
          ];
          updateMessage(sid, msgId, { content: built });
        } else {
          contentIndex++;
          charIndex = 0;
          currentText = '';
        }
      } else {
        // Non-text blocks: add instantly
        const built = [...responses.slice(0, contentIndex), block];
        contentIndex++;
        updateMessage(sid, msgId, { content: built });
      }
    }, 18);
  }, [updateMessage, setStreaming, toast]);

  // 共享发送逻辑（由 handleSend 和 ChatPanel triggerSendRef 使用）
  const doSendText = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;

    const trimmed = text.trim();

    // ---- Local slash command handling ----
    if (trimmed.startsWith('/')) {
      const [cmd, ...args] = trimmed.slice(1).split(/\s+/);
      const cmdArg = args.join(' ');

      // /help — 本地帮助
      if (cmd === 'help') {
        appendMessage(sessionId, {
          id: crypto.randomUUID(),
          sessionId,
          role: 'user',
          content: [{ type: 'text', text: '/help' }],
          createdAt: new Date().toISOString(),
        });
        appendMessage(sessionId, {
          id: crypto.randomUUID(),
          sessionId,
          role: 'assistant',
          content: [{
            type: 'text',
            text: '## 可用命令\n\n'
              + '| 命令 | 说明 |\n'
              + '|------|------|\n'
              + '| `/help` | 显示帮助信息 |\n'
              + '| `/shell <cmd>` | 执行 Shell 命令 |\n'
              + '| `/clear` | 清除当前会话消息 |\n'
              + '| `/abort` | 中止当前会话 |\n'
              + '| `/file` | 浏览文件 |\n'
              + '| `/file/content <path>` | 查看文件内容 |\n'
              + '| `/diff` | 查看差异 |\n'
              + '| `/config` | 查看配置 |\n'
              + '| `/log` | 查看日志 |\n\n'
              + '提示：在输入框中输入 `/` 可以查看所有可用命令。',
          }],
          createdAt: new Date().toISOString(),
        });
        return;
      }

      // /clear — 清除当前会话消息
      if (cmd === 'clear') {
        useMessageStore.getState().setMessages(sessionId, []);
        return;
      }

      // /abort — 中止
      if (cmd === 'abort') {
        appendMessage(sessionId, {
          id: crypto.randomUUID(),
          sessionId,
          role: 'user',
          content: [{ type: 'text', text: '/abort' }],
          createdAt: new Date().toISOString(),
        });
        useSessionStore.getState().updateSession(sessionId, { status: 'error' });
        return;
      }
    }

    // ---- Normal message send ----
    appendMessage(sessionId, {
      id: crypto.randomUUID(),
      sessionId,
      role: 'user',
      content: [{ type: 'text', text: trimmed }],
      createdAt: new Date().toISOString(),
    });

    const assId = crypto.randomUUID();
    appendMessage(sessionId, {
      id: assId,
      sessionId,
      role: 'assistant',
      content: [],
      createdAt: new Date().toISOString(),
      isStreaming: true,
    });
    setStreaming(true);
    abortRef.current = false;

    if (isConnected) {
      sendRealPrompt(sessionId, assId, trimmed);
    } else {
      simulateStream(sessionId, assId, trimmed);
    }
  }, [sessionId, isStreaming, appendMessage, setStreaming, isConnected, sendRealPrompt, simulateStream]);

  // Expose programmatic send for ChatPanel
  useEffect(() => {
    if (triggerSendRef) triggerSendRef.current = doSendText;
  }, [doSendText, triggerSendRef]);

  const handleAbort = () => {
    abortRef.current = true;
    sseAbortRef.current?.abort();
    sseAbortRef.current = null;
  };

  return (
    <div className="p-3 border-t border-dark-border-subtle light:border-light-border-subtle relative">
      {/* Popup */}
      {popupMode !== 'none' && totalItems > 0 && (
        <div className="absolute bottom-full left-3 right-3 mb-1 max-h-56 overflow-y-auto rounded-lg border border-dark-border-default bg-dark-bg-secondary shadow-dropdown z-40 animate-fade-in">
          <div className="p-1">
            {popupMode === 'slash' && filteredCommands.map((cmd, i) => (
              <button
                key={cmd.command}
                onClick={() => insertCommand(cmd.command)}
                className={cn(
                  'flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded transition-colors',
                  i === selectedIndex
                    ? 'bg-accent-blue/15 text-dark-text-primary'
                    : 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                )}
              >
                <span className="font-mono">{cmd.command}</span>
                <span className="text-dark-text-tertiary ml-4 truncate">{cmd.description}</span>
              </button>
            ))}

            {popupMode === 'mention' && filteredMentions.map((item, i) => {
              const isFile = 'type' in item && item.type === 'file';
              const isSym = 'name' in item && item.name;
              return (
                <button
                  key={'path' in item ? item.path : String(item)}
                  onClick={() => insertMention(item as { path: string; name?: string; type?: string })}
                  className={cn(
                    'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded transition-colors',
                    i === selectedIndex
                      ? 'bg-accent-blue/15 text-dark-text-primary'
                      : 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                  )}
                >
                  {isFile && <File size={13} className="text-accent-blue shrink-0" />}
                  {isSym && <Hash size={13} className="text-accent-purple shrink-0" />}
                  <span className="truncate">
                    {isSym ? (item as {name: string}).name : (item as {path: string}).path}
                  </span>
                  {isSym && (
                    <span className="ml-auto text-2xs text-dark-text-tertiary shrink-0">
                      {(item as {path: string}).path}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 bg-dark-bg-tertiary light:bg-light-bg-tertiary border border-dark-border-default light:border-light-border-default rounded-lg px-3 py-2 focus-within:border-accent-blue transition-colors">
        <button className="p-1 text-dark-text-tertiary hover:text-dark-text-primary light:text-light-text-tertiary light:hover:text-light-text-primary transition-colors shrink-0" aria-label="附件">
          <Paperclip size={16} />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="输入消息...（/ 命令 · @ 文件 · Shift+Enter 换行）"
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-dark-text-tertiary light:placeholder:text-light-text-tertiary text-dark-text-primary light:text-light-text-primary min-h-[24px] max-h-[200px]"
        />

        {isStreaming ? (
          <button onClick={handleAbort} className="p-1.5 rounded-md bg-accent-red/20 text-accent-red hover:bg-accent-red/30 transition-colors shrink-0" aria-label="中止">
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 rounded-md bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="发送"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Mock response generator（离线模式使用）
// ============================================================

function getMockResponse(userText: string): MessageContent[] {
  const lower = userText.toLowerCase();

  if (lower.includes('权限') || lower.includes('permission')) {
    return [
      { type: 'text', text: '我需要执行以下操作，请确认是否允许：' },
      {
        type: 'permission_request',
        permission: {
          id: 'perm-demo',
          name: 'execute_bash',
          summary: '在项目目录中执行 Shell 命令：ls -la',
          args: { command: 'ls -la', cwd: '/project' },
          riskLevel: 'medium' as const,
          rememberable: true,
        },
      },
    ];
  }

  if (lower.includes('代码') || lower.includes('code') || lower.includes('函数') || lower.includes('组件')) {
    return [
      { type: 'text', text: '好的，我来为你编写一个示例组件：' },
      {
        type: 'code',
        language: 'tsx',
        code: `import { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="flex items-center gap-2">\n      <button onClick={() => setCount(c => c - 1)}>-</button>\n      <span className="font-mono">{count}</span>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n    </div>\n  );\n}`,
        fileName: 'Counter.tsx',
      },
      { type: 'text', text: '\n这是一个简单的计数器组件，使用了 React 的 useState Hook。你可以在此基础上扩展功能。' },
    ];
  }

  if (lower.includes('文件') || lower.includes('file') || lower.includes('目录')) {
    return [
      { type: 'text', text: '让我查看项目文件结构：' },
      {
        type: 'tool_call',
        toolName: 'list_directory',
        args: { path: '.', recursive: false },
      },
      {
        type: 'tool_result',
        toolName: 'list_directory',
        result: 'src/\nindex.html\npackage.json\ntailwind.config.mjs\nvite.config.ts\ntsconfig.json',
      },
      { type: 'text', text: '\n以上是项目根目录的文件列表。你可以在右侧面板的"文件"标签中浏览完整的文件树。' },
    ];
  }

  if (lower.includes('帮助') || lower.includes('help') || lower.includes('你好') || lower.includes('hi')) {
    return [
      { type: 'text', text: '你好！我是 Hermes Agent，可以帮你完成以下任务：\n\n• **代码编写与修改** — 创建组件、修复 Bug、重构代码\n• **文件操作** — 浏览、搜索、编辑项目文件\n• **命令执行** — 运行 Shell 命令、构建、测试\n• **知识管理** — 记忆、技能、SOUL.md 配置\n\n你可以用 `/` 触发命令，`@` 搜索文件，或直接描述你的需求。' },
    ];
  }

  // Default
  return [
    { type: 'text', text: `收到你的消息："${userText}"\n\n我正在处理中。这是一个模拟回复——当对接真实 Hermes 后端后，这里将展示 AI 代理的实际响应。\n\n你可以尝试：\n- 输入"权限"触发权限审批卡片\n- 输入"代码"查看代码块渲染\n- 输入"文件"查看工具调用卡片\n- 输入"帮助"查看功能介绍` },
  ];
}
