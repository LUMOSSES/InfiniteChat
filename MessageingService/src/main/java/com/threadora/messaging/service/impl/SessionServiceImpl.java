package com.threadora.messaging.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.threadora.messaging.mapper.SessionMapper;
import com.threadora.messaging.model.Session;
import com.threadora.messaging.service.SessionService;
import org.springframework.stereotype.Service;

/*** @description 针对表【session(会话表)】的数据库操作Service实现
* @createDate 2024-11-04 17:54:30
*/
@Service
public class SessionServiceImpl extends ServiceImpl<SessionMapper, Session>
    implements SessionService {

}




