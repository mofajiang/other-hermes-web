import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/lib/types';

interface MessageStore {
  messages: Record<string, Message[]>; // sessionId → messages
  isStreaming: boolean;

  setMessages: (sessionId: string, msgs: Message[]) => void;
  appendMessage: (sessionId: string, msg: Message) => void;
  updateMessage: (sessionId: string, msgId: string, patch: Partial<Message>) => void;
  setStreaming: (v: boolean) => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      messages: {},
      isStreaming: false,

      setMessages: (sessionId, msgs) =>
        set((s) => ({ messages: { ...s.messages, [sessionId]: msgs } })),

      appendMessage: (sessionId, msg) =>
        set((s) => ({
          messages: {
            ...s.messages,
            [sessionId]: [...(s.messages[sessionId] || []), msg],
          },
        })),

      updateMessage: (sessionId, msgId, patch) =>
        set((s) => {
          const list = s.messages[sessionId];
          if (!list) return s;
          return {
            messages: {
              ...s.messages,
              [sessionId]: list.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
            },
          };
        }),

      setStreaming: (isStreaming) => set({ isStreaming }),
    }),
    { name: 'hermes-messages' }
  )
);
