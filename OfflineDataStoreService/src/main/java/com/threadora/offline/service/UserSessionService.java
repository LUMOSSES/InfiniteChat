package com.threadora.offline.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.offline.model.UserSession;

import java.util.Set;

public interface UserSessionService extends IService<UserSession> {
     Set<Long> findSessionIdByUserId(Long userId);

}
