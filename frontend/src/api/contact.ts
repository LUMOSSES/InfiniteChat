import api from './client';
import type { ApiResult, ContactUser, FriendApplication } from '../types';

export const contactApi = {
  searchUser: (userUuid: string, keyword: string) =>
    api.get<ApiResult<ContactUser[]>>('/v1/contact/search', { params: { userUuid, keyword } }),

  addFriend: (userUuid: string, targetId: string, msg?: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply', { userUuid, targetId, msg }),

  getApplyList: (userUuid: string) =>
    api.get<ApiResult<FriendApplication[]>>('/v1/contact/friend/apply/list', { params: { userUuid } }),

  getUnreadApplyCount: (userUuid: string) =>
    api.get<ApiResult<number>>('/v1/contact/friend/apply/unread', { params: { userUuid } }),

  acceptApply: (userUuid: string, applyId: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply/accept', { userUuid, applyId }),

  rejectApply: (userUuid: string, applyId: string) =>
    api.post<ApiResult<null>>('/v1/contact/friend/apply/reject', { userUuid, applyId }),

  getFriendList: (userUuid: string) =>
    api.get<ApiResult<ContactUser[]>>('/v1/contact/friend/list', { params: { userUuid } }),

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
