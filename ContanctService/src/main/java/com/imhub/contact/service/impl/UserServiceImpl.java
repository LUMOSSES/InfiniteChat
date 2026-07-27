package com.imhub.contact.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.imhub.contact.mapper.UserMapper;
import com.imhub.contact.model.User;
import com.imhub.contact.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}