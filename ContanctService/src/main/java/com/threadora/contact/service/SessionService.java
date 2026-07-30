package com.threadora.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.contact.data.CreateGroup.CreateGroupRequest;
import com.threadora.contact.data.CreateGroup.CreateGroupResponse;
import com.threadora.contact.model.Session;

public interface SessionService extends IService<Session> {
    CreateGroupResponse createGroup(CreateGroupRequest request);
}