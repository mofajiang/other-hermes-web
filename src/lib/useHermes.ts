import { useEffect, useCallback, useRef } from 'react';
import { useConnectionStore, initConnection } from '@/lib/connection';
import { sessionApi } from '@/lib/hermes-client';
import { useSessionStore } from '@/features/sessions/store';
import { useToastStore } from '@/ui/toast-store';

/**
 * 全局 hook：初始化 Hermes 连接 + 提供会话管理
 * Hermes 使用 OpenAI 兼容 API，会话由前端维护（conversationId + lastResponseId）
 */
export function useHermes() {
  const connectionStatus = useConnectionStore((s) => s.status);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const initRan = useRef(false);

  // 启动时检测后端 — 只跑一次
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    initConnection().then((result) => {
      if (result.ok) {
        useToastStore.getState().add('success', `已连接到 Hermes 后端 (${result.url})`);
      } else {
        console.info('[Hermes] 后端不可用，使用离线模式:', result.error);
      }
    });
  }, []);

  const isConnected = connectionStatus === 'connected';

  // ============================================================
  // Public API
  // ============================================================

  const createSession = useCallback((title?: string) => {
    const session = sessionApi.create(title);
    useSessionStore.getState().addSession(session);
    useSessionStore.getState().setActiveId(session.id);
    if (isConnected) {
      useToastStore.getState().add('success', '会话已创建');
    }
    return session;
  }, [isConnected]);

  const deleteSession = useCallback((id: string) => {
    useSessionStore.getState().removeSession(id);
  }, []);

  const renameSession = useCallback((id: string, title: string) => {
    useSessionStore.getState().updateSession(id, { title });
  }, []);

  return {
    isConnected,
    connectionStatus,
    baseUrl,
    createSession,
    deleteSession,
    renameSession,
  };
}
