import api from './client';
import type { ApiResult, Moment, MomentComment } from '../types';

export const momentApi = {
  create: (data: { userId: string; text?: string; mediaUrl?: string }) =>
    api.post<ApiResult<{ momentId: string }>>('/v1/moment', data),

  getList: (userId: string, page: number = 1, size: number = 20) =>
    api.get<ApiResult<Moment[]>>('/v1/moment/list', { params: { userId, page, size } }),

  like: (momentId: string, userId: string) =>
    api.post<ApiResult<null>>(`/v1/moment/${momentId}/like`, { userId }),

  unlike: (momentId: string, userId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/${momentId}/like`, { data: { userId } }),

  addComment: (momentId: string, userId: string, comment: string, parentCommentId?: string) =>
    api.post<ApiResult<{ commentId: string }>>(`/v1/moment/comment/${momentId}`, {
      userId, comment, parentCommentId,
    }),

  deleteComment: (commentId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/comment/${commentId}`),

  getComments: (momentId: string, page: number = 1, size: number = 20) =>
    api.get<ApiResult<MomentComment[]>>(`/v1/moment/${momentId}/comment/list`, {
      params: { page, size },
    }),

  deleteMoment: (momentId: string, userId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/${momentId}`, { params: { userId } }),
};
