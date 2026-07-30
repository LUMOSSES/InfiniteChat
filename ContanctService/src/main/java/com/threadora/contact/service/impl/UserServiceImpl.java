package com.threadora.contact.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.threadora.contact.mapper.UserMapper;
import com.threadora.contact.model.User;
import com.threadora.contact.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}