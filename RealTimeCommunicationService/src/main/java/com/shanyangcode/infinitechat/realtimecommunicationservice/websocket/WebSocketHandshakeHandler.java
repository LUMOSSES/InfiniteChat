package com.shanyangcode.infinitechat.realtimecommunicationservice.websocket;

import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshaker;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshakerFactory;
import lombok.extern.slf4j.Slf4j;

/**
 * Custom WebSocket handshake handler that replaces WebSocketServerProtocolHandler.
 * Handles the HTTP upgrade to WebSocket and fires a HandshakeCompleteEvent
 * that MessageInboundHandler listens for.
 */
@Slf4j
@Sharable
public class WebSocketHandshakeHandler extends ChannelInboundHandlerAdapter {

    private final String websocketPath;

    public WebSocketHandshakeHandler(String websocketPath) {
        this.websocketPath = websocketPath;
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof FullHttpRequest) {
            FullHttpRequest request = (FullHttpRequest) msg;
            String uri = request.uri();
            String path = uri.contains("?") ? uri.substring(0, uri.indexOf('?')) : uri;

            if (path.equals(websocketPath)) {
                log.info("Processing WebSocket handshake for path: {}", path);

                WebSocketServerHandshakerFactory wsFactory =
                        new WebSocketServerHandshakerFactory(
                                getWebSocketLocation(request), null, true, 65536);
                WebSocketServerHandshaker handshaker = wsFactory.newHandshaker(request);

                if (handshaker == null) {
                    WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
                    log.warn("Unsupported WebSocket version, sent error response");
                } else {
                    handshaker.handshake(ctx.channel(), request);
                    log.info("WebSocket handshake completed successfully");
                    // Fire a HandshakeComplete-like event with the request URI
                    // so MessageInboundHandler can extract auth params
                    ctx.fireUserEventTriggered(new HandshakeCompleteEvent(request.uri()));
                    // Remove this handler after successful handshake
                    ctx.pipeline().remove(this);
                }
                return;
            }
        }
        super.channelRead(ctx, msg);
    }

    private String getWebSocketLocation(FullHttpRequest req) {
        String protocol = "ws";
        return protocol + "://" + req.headers().get("Host") + websocketPath;
    }

    /**
     * Custom event fired after successful WebSocket handshake, carrying the request URI.
     */
    public static class HandshakeCompleteEvent {
        private final String requestUri;

        public HandshakeCompleteEvent(String requestUri) {
            this.requestUri = requestUri;
        }

        public String requestUri() {
            return requestUri;
        }
    }
}
