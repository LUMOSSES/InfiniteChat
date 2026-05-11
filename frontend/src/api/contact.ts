import api from './client';
import type { ApiResult, ContactUser, FriendApplication } from '../types';

export const contactApi = {
  searchUser: (keyword: string) =>
    api.get<ApiResult<ContactUser[]>>('/v1/contact/search', { params: { keyword } }),

  addFriend: (targetId: string, msg?: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply', { targetId, msg }),

  getApplyList: () =>
    api.get<ApiResult<FriendApplication[]>>('/v1/contact/friend/apply/list'),

  getUnreadApplyCount: () =>
    api.get<ApiResult<number>>('/v1/contact/friend/apply/unread'),

  acceptApply: (applyId: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply/accept', { applyId }),

  rejectApply: (applyId: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply/reject', { applyId }),

  getFriendList: () =>
    api.get<ApiResult<ContactUser[]>>('/v1/contact/friend/list'),

  getFriendDetail: (friendId: string) =>
    api.get<ApiResult<ContactUser>>('/v1/contact/friend/detail', { params: { friendId } }),

  deleteFriend: (friendId: string) =>
    api.delete<ApiResult<null>>('/v1/contact/friend', { data: { friendId } }),

  blockFriend: (friendId: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/block', { friendId }),

  createGroup: (name: string, memberIds: string[]) =>
    api.post<ApiResult<{ sessionId: string }>>('/v1/contact/group', { name, memberIds }),

  getGroupMembers: (sessionId: string) =>
    api.get<ApiResult<ContactUser[]>>('/v1/contact/group/members', { params: { sessionId } }),

  inviteToGroup: (sessionId: string, userIds: string[]) =>
    api.post<ApiResult<null>>('/v1/contact/group/invite', { sessionId, userIds }),

  kickFromGroup: (sessionId: string, userId: string) =>
    api.post<ApiResult<null>>('/v1/contact/group/kick', { sessionId, userId }),
};
