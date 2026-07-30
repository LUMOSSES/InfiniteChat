package com.threadora.realtime.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.threadora.realtime.constants.MessageRcvTypeEnum;
import com.threadora.realtime.constants.PushTypeEnum;
import com.threadora.realtime.data.PushMoment.FriendApplicationNotification;
import com.threadora.realtime.data.PushMoment.NewGroupSessionNotification;
import com.threadora.realtime.data.PushMoment.NewSessionNotification;
import com.threadora.realtime.data.PushMoment.PushMomentRequest;
import com.threadora.realtime.data.ReceiveMessage.ReceiveMessageRequest;
import com.threadora.realtime.excption.ServiceException;
import com.threadora.realtime.model.*;
import com.threadora.realtime.websocket.ChannelManager;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class NettyMessageService {
    public void sendPush(PushTypeEnum pushType, Object data, String receiveUserUuid) {
        if (pushType == null || data == null || receiveUserUuid == null) {
            log.error("推送消息的类型、数据或接收用户UUID为空！");
            throw new ServiceException("用户" + receiveUserUuid + "的通道不可用或不活跃，推送消息失败。");
        }

        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setType(pushType.getCode());
        messageDTO.setData(data);

        Channel channel = ChannelManager.getChannelByUserId(receiveUserUuid);
        if (channel != null && channel.isActive()) {
            log.info("准备发送消息，channel 状态: active={}, id={}, 发送内容: {}",
                    channel.isActive(),
                    channel.id(),
                    JSONUtil.toJsonStr(messageDTO));
            // 创建 WebSocket 帧
            TextWebSocketFrame frame = new TextWebSocketFrame(JSONUtil.toJsonStr(messageDTO));
            // 发送消息并添加监听器来处理发送结果
            channel.writeAndFlush(frame).addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) throws Exception {
                    if (future.isSuccess()) {
                        log.info("消息发送成功: {}", messageDTO);
                    } else {
                        log.error("消息发送失败: {}", future.cause());
                    }
                }
            });
        }
    }

    public void sendMessageToUser(ReceiveMessageRequest message){
        switch (MessageRcvTypeEnum.fromCode(message.getType())){
            case TEXT_MESSAGE:
                TextMessage textMessage = new TextMessage();
                BeanUtils.copyProperties(message, textMessage);
                // Long→String conversion for fields sent to frontend via WebSocket JSON
                copyLongFields(message, textMessage);
                TextMessageBody textBean = convertBody(message.getBody(), TextMessageBody.class);
                textMessage.setBody(textBean);
                log.info("textMessage:{}", textMessage);
                List<Long> textReceiveUserIds = message.getReceiveUserIds();
                for (Long textReceiveUser : textReceiveUserIds) {
                    log.info("textReceiveUser:{}", textReceiveUser);
                    log.info("是否存在管道: {}", ChannelManager.getChannelByUserId(textReceiveUser.toString()));
                    if (ChannelManager.getChannelByUserId(textReceiveUser.toString()) != null) {
                        log.info("调用 sendPush: {}", textReceiveUser);
                        sendPush(PushTypeEnum.MESSAGE_NOTIFICATION, textMessage, textReceiveUser.toString());
                    }
                }
                break;
            case PICTURE_MESSAGE:
                PictureMessage pictureMessage = new PictureMessage();
                BeanUtils.copyProperties(message, pictureMessage);
                copyLongFields(message, pictureMessage);
                PictureMessageBody pictureBean = convertBody(message.getBody(), PictureMessageBody.class);
                pictureMessage.setBody(pictureBean);
                log.info("pictureMessage:{}", pictureMessage);
                List<Long> pictureReceiveUserIds = message.getReceiveUserIds();
                for (Long pictureReceiveUser : pictureReceiveUserIds) {
                    if (ChannelManager.getChannelByUserId(pictureReceiveUser.toString()) != null) {
                        sendPush(PushTypeEnum.MESSAGE_NOTIFICATION, pictureMessage, pictureReceiveUser.toString());
                    }
                }
                break;
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T convertBody(Object body, Class<T> targetClass) {
        if (body == null) {
            try {
                return targetClass.getDeclaredConstructor().newInstance();
            } catch (Exception e) {
                log.error("Failed to create instance of {}", targetClass.getSimpleName(), e);
                return null;
            }
        }
        if (body instanceof String) {
            // Fastjson sends body as string, Jackson deserializes it as String
            String bodyStr = (String) body;
            // Try to parse as JSON object first (e.g., {"content":"hello","replyId":"..."})
            if (bodyStr.trim().startsWith("{")) {
                try {
                    return new ObjectMapper().readValue(bodyStr, targetClass);
                } catch (Exception e) {
                    log.warn("Failed to parse body as JSON object, treating as plain content: {}", bodyStr);
                }
            }
            // Plain text content: create target bean and populate known fields
            try {
                T bean = targetClass.getDeclaredConstructor().newInstance();
                try {
                    targetClass.getMethod("setContent", String.class).invoke(bean, bodyStr);
                } catch (NoSuchMethodException ignored) {
                    // target class doesn't have a content field
                }
                return bean;
            } catch (Exception e) {
                log.error("Failed to create bean from string body", e);
                return null;
            }
        }
        // Body is a Map (Jackson deserialized JSON object) — use BeanUtil
        return BeanUtil.toBean(body, targetClass);
    }

    private void copyLongFields(ReceiveMessageRequest src, com.threadora.realtime.model.Message dest) {
        dest.setSendUserId(src.getSendUserId() != null ? src.getSendUserId().toString() : null);
        dest.setSessionId(src.getSessionId() != null ? src.getSessionId().toString() : null);
        dest.setMessageId(src.getMessageId() != null ? src.getMessageId().toString() : null);
    }

    public void sendNoticeMoment(PushMomentRequest request) {
        List<Long> userIds = request.getReceiveUserIds();
        for (Long userId : userIds) {
            if (ChannelManager.getChannelByUserId(userId.toString()) != null) {
                request.setReceiveUserIds(null);
                sendPush(PushTypeEnum.MOMENT_NOTIFICATION, request, userId.toString());
            }
        }
    }

    public void sendFriendApplicationNotification(FriendApplicationNotification notification, String userId) {
        sendPush(PushTypeEnum.FRIEND_APPLICATION_NOTIFICATION, notification, userId);
    }

    public void sendNewSessionNotification(NewSessionNotification notification, String userId) {
        sendPush(PushTypeEnum.NEW_SESSION_NOTIFICATION, notification, userId);
    }

    public void sendNewGroupSessionNotification(NewGroupSessionNotification notification, String userId) {
        sendPush(PushTypeEnum.NEW_SESSION_NOTIFICATION, notification, userId);
    }
}