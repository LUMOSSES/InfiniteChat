package com.threadora.offline.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.threadora.offline.mapper.SessionMapper;
import com.threadora.offline.model.Session;
import com.threadora.offline.service.SessionService;
import org.springframework.stereotype.Service;

@Service
public class SessionServiceImpl extends ServiceImpl<SessionMapper, Session>
    implements SessionService {

}




