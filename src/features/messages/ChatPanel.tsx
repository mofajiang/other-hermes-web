import { useCallback, useRef } from 'react';
import { useSessionStore } from '@/features/sessions/store';
import { useMessageStore } from './store';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { MessageSquare } from 'lucide-react';
import type { Message } from '@/lib/types';

export function ChatPanel() {
  const activeId = useSessionStore((s) => s.activeId);
  const messages = useMessageStore((s) => (activeId ? s.messages[activeId] : undefined));
  const isStreaming = useMessageStore((s) => s.isStreaming);
  const addSession = useSessionStore((s) => s.addSession);
  const setActiveId = useSessionStore((s) => s.setActiveId);
  const appendMessage = useMessageStore((s) => s.appendMessage);

  // ChatInput exposes a triggerSend ref for programmatic sends
  const triggerSendRef = useRef<((text: string) => void) | null>(null);

  const handleRegenerate = useCallback((msg: Message) => {
    if (!activeId || isStreaming) return;
    // Find the last user message before this assistant message
    const msgs = useMessageStore.getState().messages[activeId] || [];
    const idx = msgs.findIndex((m) => m.id === msg.id);
    const userMsg = [...msgs].slice(0, idx).reverse().find((m) => m.role === 'user');
    if (!userMsg) return;
    const text = userMsg.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    if (text && triggerSendRef.current) triggerSendRef.current(text);
  }, [activeId, isStreaming]);

  const handleEdit = useCallback((msg: Message) => {
    if (msg.role !== 'user') return;
    const text = msg.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    if (text && triggerSendRef.current) triggerSendRef.current(text);
  }, []);

  const handleFork = useCallback((msg: Message) => {
    if (!activeId) return;
    const msgs = useMessageStore.getState().messages[activeId] || [];
    const idx = msgs.findIndex((m) => m.id === msg.id);
    const toCopy = msgs.slice(0, idx + 1);
    // Create new session
    const newId = crypto.randomUUID();
    addSession({
      id: newId,
      title: '分叉会话',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveId(newId);
    // Copy messages
    for (const m of toCopy) {
      appendMessage(newId, { ...m, id: crypto.randomUUID(), sessionId: newId });
    }
  }, [activeId, addSession, setActiveId, appendMessage]);

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!activeId && (
          <div className="flex flex-col items-center justify-center h-full text-dark-text-tertiary light:text-light-text-tertiary select-none">
            <MessageSquare size={48} className="mb-3 opacity-40" />
            <p className="text-sm">选择一个会话或创建新会话开始</p>
          </div>
        )}

        {activeId && (!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-dark-text-tertiary light:text-light-text-tertiary select-none">
            <p className="text-sm">开始对话...</p>
          </div>
        )}

        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRegenerate={msg.role === 'assistant' ? () => handleRegenerate(msg) : undefined}
            onEdit={msg.role === 'user' ? () => handleEdit(msg) : undefined}
            onFork={() => handleFork(msg)}
          />
        ))}
      </div>

      {/* Input */}
      {activeId && <ChatInput sessionId={activeId} isStreaming={isStreaming} triggerSendRef={triggerSendRef} />}
    </div>
  );
}
