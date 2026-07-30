package com.threadora.contact.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.threadora.contact.mapper.UserSessionMapper;
import com.threadora.contact.model.UserSession;
import com.threadora.contact.service.UserSessionService;
import org.springframework.stereotype.Service;

@Service
public class UserSessionServiceImpl extends ServiceImpl<UserSessionMapper, UserSession> implements UserSessionService {
}