import api from './client';
import type { ApiResult, Moment, MomentComment } from '../types';

export const momentApi = {
  create: (data: { text?: string; mediaUrl?: string }) =>
    api.post<ApiResult<{ momentId: string }>>('/v1/moment', data),

  getList: (page: number = 1, size: number = 10) =>
    api.get<ApiResult<Moment[]>>('/v1/moment/list', { params: { page, size } }),

  like: (momentId: string) =>
    api.post<ApiResult<null>>(`/v1/moment/${momentId}/like`),

  unlike: (momentId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/${momentId}/like`),

  addComment: (momentId: string, comment: string, parentCommentId?: string) =>
    api.post<ApiResult<{ commentId: string }>>('/v1/moment/comment', {
      momentId, comment, parentCommentId,
    }),

  deleteComment: (commentId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/comment/${commentId}`),

  getComments: (momentId: string, page: number = 1, size: number = 20) =>
    api.get<ApiResult<MomentComment[]>>(`/v1/moment/${momentId}/comment/list`, {
      params: { page, size },
    }),

  deleteMoment: (momentId: string) =>
    api.delete<ApiResult<null>>(`/v1/moment/${momentId}`),
};
