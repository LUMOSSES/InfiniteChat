package com.threadora.contact.service;

import com.threadora.contact.data.ExitGroup.ExitGroupRequest;
import com.threadora.contact.data.ExitGroup.ExitGroupResponse;

/**
 * 退出群聊服务接口
 */
public interface ExitGroupService {
    ExitGroupResponse exitGroup(ExitGroupRequest request);
}