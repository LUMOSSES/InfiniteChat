export interface User {
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  avatar?: string;
  signature?: string;
  gender?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends User {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  code: string;
}

export interface ApiResult<T = unknown> {
  code: number;
  msg: string | null;
  data: T;
}

export interface ContactUser {
  userId: string;
  userName: string;
  avatar?: string;
  email: string;
}

export interface FriendApplication {
  id: string;
  userId: string;
  targetId: string;
  msg?: string;
  status: number;
  createdAt: string;
}

export interface Session {
  id: string;
  name?: string;
  type: number;
  status: number;
}

export interface Message {
  messageId: string;
  senderId: string;
  sessionId: string;
  type: number;
  content?: string;
  replyId?: string;
  sessionType: number;
  createdAt: string;
}

export interface Moment {
  momentId: string;
  userId: string;
  text?: string;
  mediaUrl?: string;
  createTime: string;
  likeCount?: number;
  commentCount?: number;
  liked?: boolean;
  user?: ContactUser;
}

export interface MomentComment {
  commentId: string;
  momentId: string;
  userId: string;
  parentCommentId?: string;
  comment: string;
  createTime: string;
  user?: ContactUser;
}
