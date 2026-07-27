package com.imhub.messaging.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.messaging.data.senRedPackage.SendRedPacketRequest;
import com.imhub.messaging.data.senRedPackage.SendRedPacketResponse;
import com.imhub.messaging.model.RedPacket;


public interface RedPacketService extends IService<RedPacket> {
    /**
     * 发送红包
     * @param request
     * @return
     * @throws Exception
     */
    SendRedPacketResponse sendRedPacket(SendRedPacketRequest request) throws Exception;

    /**
     * 红包过期处理
     *
     * @param redPacketId 红包Id
     */
    void handleExpiredRedPacket(Long redPacketId);
}