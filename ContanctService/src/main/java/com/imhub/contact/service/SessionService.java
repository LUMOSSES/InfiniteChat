package com.imhub.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.contact.data.CreateGroup.CreateGroupRequest;
import com.imhub.contact.data.CreateGroup.CreateGroupResponse;
import com.imhub.contact.model.Session;

public interface SessionService extends IService<Session> {
    CreateGroupResponse createGroup(CreateGroupRequest request);
}