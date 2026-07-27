package com.imhub.offline.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.offline.model.UserSession;

import java.util.Set;

public interface UserSessionService extends IService<UserSession> {
     Set<Long> findSessionIdByUserId(Long userId);

}
