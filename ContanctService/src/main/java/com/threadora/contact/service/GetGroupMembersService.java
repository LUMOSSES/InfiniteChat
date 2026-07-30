package com.threadora.contact.service;

import com.threadora.contact.data.GetGroupMembers.GroupMembersRequest;
import com.threadora.contact.data.GetGroupMembers.GroupMembersResponse;

/**
 * 群聊成员获取服务接口
 */
public interface GetGroupMembersService {

    GroupMembersResponse getGroupMembers(GroupMembersRequest request);
}