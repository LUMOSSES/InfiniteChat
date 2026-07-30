package com.threadora.messaging.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.messaging.data.senRedPackage.SendRedPacketRequest;
import com.threadora.messaging.data.senRedPackage.SendRedPacketResponse;
import com.threadora.messaging.model.RedPacket;


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