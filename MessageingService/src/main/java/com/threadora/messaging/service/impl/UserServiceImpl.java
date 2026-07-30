package com.threadora.messaging.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.threadora.messaging.mapper.UserMapper;
import com.threadora.messaging.model.User;
import com.threadora.messaging.service.UserService;
import org.springframework.stereotype.Service;

/*** @description 针对表【user(用户表)】的数据库操作Service实现
* @createDate 2024-10-17 14:21:28
*/
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
    implements UserService {

}




