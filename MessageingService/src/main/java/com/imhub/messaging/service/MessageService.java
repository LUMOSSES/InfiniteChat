package com.imhub.messaging.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.messaging.data.sendMsg.SendMsgRequest;
import com.imhub.messaging.data.sendMsg.SendMsgResponse;
import com.imhub.messaging.model.Message;
import org.springframework.stereotype.Service;

@Service
public interface MessageService extends IService<Message> {
    SendMsgResponse sendMessage(SendMsgRequest request);
}