package com.imhub.contact.service;

import com.imhub.contact.data.ExitGroup.ExitGroupRequest;
import com.imhub.contact.data.ExitGroup.ExitGroupResponse;

/**
 * 退出群聊服务接口
 */
public interface ExitGroupService {
    ExitGroupResponse exitGroup(ExitGroupRequest request);
}