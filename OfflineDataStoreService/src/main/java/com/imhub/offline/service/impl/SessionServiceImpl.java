package com.imhub.offline.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.imhub.offline.mapper.SessionMapper;
import com.imhub.offline.model.Session;
import com.imhub.offline.service.SessionService;
import org.springframework.stereotype.Service;

@Service
public class SessionServiceImpl extends ServiceImpl<SessionMapper, Session>
    implements SessionService {

}




