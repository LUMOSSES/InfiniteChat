package com.imhub.realtime.websocket;

import cn.hutool.json.JSONUtil;
import com.imhub.realtime.constants.MessageTypeEnum;
import com.imhub.realtime.constants.UserConstants;
import com.imhub.realtime.excption.MessageTypeException;
import com.imhub.realtime.model.AckData;
import com.imhub.realtime.model.LogOutData;
import com.imhub.realtime.model.MessageDTO;
import com.imhub.realtime.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.QueryStringDecoder;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import com.imhub.realtime.websocket.WebSocketHandshakeHandler.HandshakeCompleteEvent;
import io.netty.handler.timeout.IdleStateEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.net.InetAddress;
import java.util.List;
import java.util.Map;


@Slf4j
@Sharable
@AllArgsConstructor
public class MessageInboundHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {

    private StringRedisTemplate redisTemplate;

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, TextWebSocketFrame msg) throws Exception {
        log.info("服务端收到了消息：{}", msg.text());

        MessageDTO messageDTO = JSONUtil.toBean(msg.text(), MessageDTO.class);
        // ACK
        // HEART_BEAT
        // LOG_OUT

        MessageTypeEnum messageType = MessageTypeEnum.of(messageDTO.getType());
        switch (messageType){
            case ACK:
                processACK(messageDTO);
                break;
            case LOG_OUT:
                processLogOut(ctx, messageDTO);
                break;
            case HEART_BEAT:
                processHeartBeat(ctx, messageDTO);
                break;
            default:
                processIllegal(messageDTO);
                break;
        }
    }

    private void processACK(MessageDTO msg){
        // 处理客户端成功返回的数据
        AckData ackData = JSONUtil.toBean(msg.getData().toString(), AckData.class);
        log.info("ackData:{}",ackData);
        log.info("推送消息成功！");
    }

    private void processLogOut(ChannelHandlerContext ctx, MessageDTO msg){
        LogOutData logOutData = JSONUtil.toBean(msg.getData().toString(), LogOutData.class);
        Integer userUuid = logOutData.getUserUuid();
        log.info("请求断开用户{}的连接...",userUuid);
        offline(ctx);
        log.info("断开连接成功！");
    }

    private void processHeartBeat(ChannelHandlerContext ctx, MessageDTO msg){
        log.info("收到心跳包");
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setType(MessageTypeEnum.HEART_BEAT.getCode());
        TextWebSocketFrame frame = new TextWebSocketFrame(JSONUtil.toJsonStr(messageDTO));
        ctx.channel().writeAndFlush(frame);
    }

    private void processIllegal(MessageDTO msg){
        throw new MessageTypeException("不支持的消息格式！");
    }


    // 管道打开时调用
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        log.info("websocket has build");
    }

    // 当管道关闭时调用
    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        offline(ctx);

        super.channelInactive(ctx);
    }


    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        log.info("userEventTriggered: evt type={}", evt != null ? evt.getClass().getName() : "null");
        // 处理心跳
        if (evt instanceof IdleStateEvent){
            IdleStateEvent event = (IdleStateEvent) evt;

            switch (event.state()){
                case READER_IDLE:
                    log.error("读空闲超时，关闭连接...{}, 用户ID{}",ctx.channel().remoteAddress(), ChannelManager.getUserByChannel(ctx.channel()));
                    offline(ctx);
                    break;
                case WRITER_IDLE:
                    log.error("写空闲超时");
                case ALL_IDLE:
                    log.error("读写空闲超时");
            }
        }
        // 处理握手，协议升级

        if (evt instanceof HandshakeCompleteEvent){
            HandshakeCompleteEvent handshake = (HandshakeCompleteEvent) evt;

            // Browser WebSocket API cannot set custom HTTP headers.
            // Extract token and userUuid from URL query parameters.
            Map<String, List<String>> params = new QueryStringDecoder(handshake.requestUri()).parameters();
            String userUuid = getParam(params, "userUuid");
            String token = getParam(params, "token");
            log.info("HandshakeComplete: token={}, userUuid={}", token, userUuid);

            // 对 token 进行校验，不通过则直接进行关闭
            if (!validateToken(userUuid, token)){
                log.info("token invalid");
                ctx.close();
                return;
            }

            // 将登录信息放入到 redis，用户与 netty 服务器的映射
            redisTemplate.opsForValue().set(UserConstants.USER_SESSION + userUuid, InetAddress.getLocalHost().getHostAddress());

            // 存储用户的管道信息
            Channel channel = ChannelManager.getChannelByUserId(userUuid);
            if (channel != null) {
                ChannelManager.removeUserChannel(userUuid);
                ChannelManager.removeChannelUser(channel);
                channel.close();
            }

            // 在将新的 channel 放入到其中
            ChannelManager.addUserChannel(userUuid, ctx.channel());
            ChannelManager.addChannelUser(userUuid, ctx.channel());
            log.info("客户连接成功， 用户ID：{}",userUuid + "管道地址： " + ctx.channel().remoteAddress());
        }

    }

    // 下线函数
    public void offline(ChannelHandlerContext ctx){
        String userUuid = ChannelManager.getUserByChannel(ctx.channel());

        try{
            ChannelManager.removeChannelUser(ctx.channel());
            if (userUuid != null){
                // 只有当关闭的管道就是当前注册的管道时才移除用户映射，防止新连接的管道被误删
                Channel currentChannel = ChannelManager.getChannelByUserId(userUuid);
                if (currentChannel == null || currentChannel == ctx.channel()) {
                    ChannelManager.removeUserChannel(userUuid);
                }
                log.info("客户端关闭连接UserId：{}, 客户端地址为：{}",userUuid, ctx.channel().remoteAddress());
            }
        }catch (Exception e){
            log.error("处理退出登录异常", e);
        }finally {
            // 关闭通道
            if (ctx.channel() != null){
                ctx.channel().close();
            }
            // 在redis中删除对应的key
            redisTemplate.opsForValue().getAndDelete(UserConstants.USER_SESSION + userUuid);
        }
    }

    private boolean validateToken(String userUuid, String token){
        try {
            Claims claims = JwtUtil.parse(token);
            String userId = claims.getSubject();
            return userId != null && userId.equals(userUuid);
        } catch (Exception e) {
            log.warn("Token validation failed for userUuid={}: {}", userUuid, e.getMessage());
            return false;
        }
    }

    private String getParam(Map<String, List<String>> params, String key) {
        List<String> values = params.get(key);
        return values != null && !values.isEmpty() ? values.get(0) : "";
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause){
        log.error("捕获到异常：", cause);

        try {
            offline(ctx);
        }catch (Exception e){
            log.error("关闭管道失败", e);
        }
    }
}
