import api from './client';
import type { ApiResult } from '../types';

export interface EmailCodeResponse {
  email: string;
}

export const authApi = {
  sendEmailCode: (email: string) =>
    api.get<ApiResult<EmailCodeResponse>>('/v1/user/common/email', { params: { email } }),

  register: (data: { email: string; password: string; code: string }) =>
    api.post<ApiResult<{ email: string }>>('/v1/user/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResult<{ token: string; userId: string; userName: string; email: string; avatar?: string }>>('/v1/user/login', data),

  loginCode: (data: { email: string; code: string }) =>
    api.post<ApiResult<{ token: string; userId: string; userName: string; email: string }>>('/v1/user/loginCode', data),

  updateAvatar: (avatarUrl: string) =>
    api.patch<ApiResult<{ avatar: string }>>('/v1/user/avatar', { avatarUrl }),

  getUploadUrl: (fileName: string) =>
    api.get<ApiResult<{ uploadUrl: string; downloadUrl: string }>>('/v1/user/common/uploadUrl', { params: { fileName } }),
};
