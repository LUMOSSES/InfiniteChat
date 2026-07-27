package com.imhub.contact.service;

import com.imhub.contact.data.GetGroupMembers.GroupMembersRequest;
import com.imhub.contact.data.GetGroupMembers.GroupMembersResponse;

/**
 * 群聊成员获取服务接口
 */
public interface GetGroupMembersService {

    GroupMembersResponse getGroupMembers(GroupMembersRequest request);
}