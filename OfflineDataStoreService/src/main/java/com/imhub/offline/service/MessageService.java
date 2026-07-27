package com.imhub.offline.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.offline.data.offlineMessage.OfflineMessageRequest;
import com.imhub.offline.data.offlineMessage.OfflineMessageResponse;
import com.imhub.offline.model.Message;


public interface MessageService extends IService<Message> {

    OfflineMessageResponse getOfflineMessage(OfflineMessageRequest request);

    void saveOfflineMessage(String message);
}
