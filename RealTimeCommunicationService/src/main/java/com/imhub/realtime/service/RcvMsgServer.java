package com.imhub.realtime.service;

import com.imhub.realtime.data.ReceiveMessage.ReceiveMessageRequest;
import com.imhub.realtime.data.ReceiveMessage.ReceiveMessageResponse;

public interface RcvMsgServer {
    ReceiveMessageResponse receiveMessage(ReceiveMessageRequest request);
}