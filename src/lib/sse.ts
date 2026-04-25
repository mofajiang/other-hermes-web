// SSE 客户端 —— 基于 fetch + ReadableStream
// Hermes Responses API SSE 格式:
//   event: response.output_text.delta
//   data: {"delta":"Hello","output_index":0}
//   event: response.completed
//   data: {"id":"..."}

type SSECallback = {
  onOpen?: () => void;
  /** event 为 SSE 事件类型，data 为解析后的 JSON 或原始字符串 */
  onEvent?: (event: string, data: unknown) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
};

export interface SSEOptions {
  url: string;
  body: string;
  headers?: Record<string, string>;
}

export async function connectSSE(
  options: SSEOptions,
  callbacks: SSECallback,
): Promise<AbortController> {
  const controller = new AbortController();

  try {
    const response = await fetch(options.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...options.headers,
      },
      body: options.body,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`SSE 连接失败: HTTP ${response.status} ${errText}`);
    }

    callbacks.onOpen?.();

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = 'message';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        callbacks.onClose?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        // SSE event: 行
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }

        // SSE data: 行
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();

          // OpenAI 流结束标记
          if (raw === '[DONE]') {
            callbacks.onEvent?.('done', null);
            callbacks.onClose?.();
            reader.cancel();
            return controller;
          }

          try {
            const parsed = JSON.parse(raw);
            callbacks.onEvent?.(currentEvent, parsed);
          } catch {
            // 非 JSON → 作为纯文本 token
            callbacks.onEvent?.(currentEvent, raw);
          }
          currentEvent = 'message'; // reset
          continue;
        }

        // 空行 = 事件边界
        if (line.trim() === '') {
          currentEvent = 'message';
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      callbacks.onError?.(err as Error);
    }
  }

  return controller;
}
