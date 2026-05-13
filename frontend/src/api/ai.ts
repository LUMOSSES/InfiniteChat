import api from './client';
import type { ApiResult } from '../types';

export interface AiChatRequest {
  sessionId: number;
  prompt: string;
}

export const aiApi = {
  /** 非流式对话 */
  chat: (data: AiChatRequest) =>
    api.post<ApiResult<string>>('/v1/ai/chat', data),

  /** SSE 流式对话 — 返回 ReadableStream 供调用方逐块读取 */
  streamChat: (data: AiChatRequest): Promise<Response> => {
    const token = localStorage.getItem('token');
    return fetch('/api/v1/ai/streamChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(data),
    });
  },
};
