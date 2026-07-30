package com.threadora.offline.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.offline.data.offlineMessage.OfflineMessageRequest;
import com.threadora.offline.data.offlineMessage.OfflineMessageResponse;
import com.threadora.offline.model.Message;


public interface MessageService extends IService<Message> {

    OfflineMessageResponse getOfflineMessage(OfflineMessageRequest request);

    void saveOfflineMessage(String message);
}
