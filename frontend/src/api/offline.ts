import api from './client';
import type { ApiResult } from '../types';

interface OfflineMessageBody {
  content: string;
  createdAt: string;
  replyId?: string;
}

interface OfflineMessageDetail {
  messageId: string;
  sendUserId: string;
  type: number;
  userName: string;
  avatar: string;
  offlineMessageBody: OfflineMessageBody;
}

interface OfflineMessageGroup {
  total: number;
  sessionId: string;
  sessionName: string;
  sessionAvatar: string;
  sessionType: number;
  offlineMessageDetails: OfflineMessageDetail[];
}

interface OfflineMessageResponse {
  offlineMessages: OfflineMessageGroup[];
}

export const offlineApi = {
  getOfflineMessages: (userId?: string) =>
    api.get<ApiResult<OfflineMessageResponse>>('/v1/offline/message', {
      params: { userId, time: new Date(0).toISOString() },
    }),
};
