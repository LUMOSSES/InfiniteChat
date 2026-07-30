package com.threadora.messaging.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.messaging.data.sendMsg.SendMsgRequest;
import com.threadora.messaging.data.sendMsg.SendMsgResponse;
import com.threadora.messaging.model.Message;
import org.springframework.stereotype.Service;

@Service
public interface MessageService extends IService<Message> {
    SendMsgResponse sendMessage(SendMsgRequest request);
}