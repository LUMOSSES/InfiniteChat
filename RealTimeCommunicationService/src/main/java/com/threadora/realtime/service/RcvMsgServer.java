package com.threadora.realtime.service;

import com.threadora.realtime.data.ReceiveMessage.ReceiveMessageRequest;
import com.threadora.realtime.data.ReceiveMessage.ReceiveMessageResponse;

public interface RcvMsgServer {
    ReceiveMessageResponse receiveMessage(ReceiveMessageRequest request);
}