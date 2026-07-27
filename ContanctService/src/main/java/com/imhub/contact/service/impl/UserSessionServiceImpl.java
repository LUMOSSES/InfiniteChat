package com.imhub.contact.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.imhub.contact.mapper.UserSessionMapper;
import com.imhub.contact.model.UserSession;
import com.imhub.contact.service.UserSessionService;
import org.springframework.stereotype.Service;

@Service
public class UserSessionServiceImpl extends ServiceImpl<UserSessionMapper, UserSession> implements UserSessionService {
}