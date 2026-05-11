import api from './client';
import type { ApiResult } from '../types';

export const messageApi = {
  sendMessage: (data: {
    sessionId: string;
    content: string;
    type?: number;
    sessionType?: number;
  }) => api.post<ApiResult<{ messageId: string }>>('/v1/chat/session', data),

  sendRedPacket: (data: {
    sessionId: string;
    totalAmount: number;
    totalCount: number;
    type?: number;
    wrapperText?: string;
  }) => api.post<ApiResult<{ redPacketId: string }>>('/v1/chat/redPacket/send', data),

  receiveRedPacket: (redPacketId: string) =>
    api.post<ApiResult<{ amount: number }>>('/v1/chat/redPacket/receive', { redPacketId }),

  getRedPacketDetail: (redPacketId: string) =>
    api.get<ApiResult<{
      redPacketId: string;
      totalAmount: number;
      totalCount: number;
      remainingAmount: number;
      remainingCount: number;
      receivers: Array<{ userId: string; userName: string; amount: number }>;
    }>>('/v1/chat/redPacket/detail', { params: { redPacketId } }),
};
