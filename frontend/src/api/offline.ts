import api from './client';
import type { ApiResult, Message } from '../types';

export const offlineApi = {
  getOfflineMessages: (userId?: string) =>
    api.get<ApiResult<Message[]>>('/v1/offline/messages', { params: { userId } }),
};
