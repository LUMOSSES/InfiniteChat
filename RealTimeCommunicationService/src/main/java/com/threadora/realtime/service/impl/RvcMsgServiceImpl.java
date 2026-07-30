package com.threadora.realtime.service.impl;

import com.threadora.realtime.data.ReceiveMessage.ReceiveMessageRequest;
import com.threadora.realtime.data.ReceiveMessage.ReceiveMessageResponse;
import com.threadora.realtime.service.RcvMsgServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.Valid;

@Service
@Slf4j
public class RvcMsgServiceImpl implements RcvMsgServer {

    @Autowired
    private NettyMessageService nettyMessageService;
    @Override
    public ReceiveMessageResponse receiveMessage(@Valid ReceiveMessageRequest request) {
        nettyMessageService.sendMessageToUser(request);

        return new ReceiveMessageResponse().setMessageId(request.getMessageId());
    }
}