package com.threadora.realtime.websocket;

import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.QueryStringDecoder;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
@Sharable
public class WebSocketTokenAuthHeader extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof FullHttpRequest){
            FullHttpRequest request = (FullHttpRequest) msg;

            // Browser WebSocket API cannot set custom HTTP headers.
            // Extract token and userUuid from URL query parameters.
            Map<String, List<String>> params = new QueryStringDecoder(request.uri()).parameters();
            String userUuid = getParam(params, "userUuid");
            String token = getParam(params, "token");
            log.info("WebSocketTokenAuthHeader: extracted token={}, userUuid={}", token, userUuid);

            NettyUtils.setAttr(ctx.channel(), NettyUtils.TOKEN, token);
            NettyUtils.setAttr(ctx.channel(), NettyUtils.UID, userUuid);

            // Remove self and forward — must use ChannelHandlerContext to remove from pipeline
            // then delegate to super which will call fireChannelRead on the next handler
            ctx.pipeline().remove(this);
            super.channelRead(ctx, msg);
        }else {
            super.channelRead(ctx, msg);
        }
    }

    private String getParam(Map<String, List<String>> params, String key) {
        List<String> values = params.get(key);
        return values != null && !values.isEmpty() ? values.get(0) : "";
    }
}