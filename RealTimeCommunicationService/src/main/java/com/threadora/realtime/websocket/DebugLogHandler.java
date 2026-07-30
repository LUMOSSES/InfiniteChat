package com.threadora.realtime.websocket;

import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Sharable
public class DebugLogHandler extends ChannelInboundHandlerAdapter {
    private final String label;

    public DebugLogHandler(String label) {
        this.label = label;
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        log.info("[{}] msg type={}", label, msg != null ? msg.getClass().getName() : "null");
        if (msg instanceof FullHttpRequest) {
            FullHttpRequest req = (FullHttpRequest) msg;
            log.info("[{}] HTTP request: method={} uri={} headers={}",
                    label, req.method(), req.uri(), req.headers());
        }
        super.channelRead(ctx, msg);
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        log.info("[{}] userEvent: type={}", label, evt != null ? evt.getClass().getName() : "null");
        super.userEventTriggered(ctx, evt);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        log.error("[{}] exception: {}", label, cause.getMessage(), cause);
        super.exceptionCaught(ctx, cause);
    }
}
