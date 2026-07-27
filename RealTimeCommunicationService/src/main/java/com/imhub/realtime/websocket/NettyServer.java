package com.imhub.realtime.websocket;

import com.alibaba.cloud.nacos.NacosServiceManager;
import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.naming.NamingService;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.timeout.IdleStateHandler;
import io.netty.util.NettyRuntime;
import io.netty.util.concurrent.Future;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.net.InetAddress;
import java.net.UnknownHostException;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class NettyServer {
    @Value("${netty.port}")
    private int port;

    @Value("${netty.name}")
    private String serverName;

    @Autowired
    private NacosServiceManager nacosServiceManager;

    @Autowired
    private StringRedisTemplate redisTemplate;

    // discoveryClient 服务发现客户端
    private final DiscoveryClient discoveryClient;

    private EventLoopGroup bossGroup = new NioEventLoopGroup(1);

    private EventLoopGroup workerGroup = new NioEventLoopGroup(NettyRuntime.availableProcessors());

    @PostConstruct
    public void start() throws InterruptedException, UnknownHostException {
        run();
        try {
            NamingService namingService = nacosServiceManager.getNamingService();
            namingService.registerInstance(this.serverName, InetAddress.getLocalHost().getHostAddress(), this.port);
            log.info("netty server registered to nacos");
        } catch (Exception e) {
            log.warn("nacos registration failed, will retry: {}", e.getMessage());
            new Thread(() -> {
                for (int i = 0; i < 10; i++) {
                    try {
                        Thread.sleep(5000);
                        NamingService ns = nacosServiceManager.getNamingService();
                        ns.registerInstance(serverName, InetAddress.getLocalHost().getHostAddress(), port);
                        log.info("netty server registered to nacos (retry success)");
                        return;
                    } catch (Exception ignored) {
                        log.warn("nacos registration retry {} failed", i + 1);
                    }
                }
                log.error("nacos registration failed after all retries");
            }).start();
        }
        log.info("netty server start success");
    }

    public void run() throws InterruptedException {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap.group(bossGroup, workerGroup)
                .channel(NioServerSocketChannel.class)
                .option(ChannelOption.SO_BACKLOG,  128)
                .childOption(ChannelOption.SO_KEEPALIVE, true)
                .handler(new LoggingHandler(LogLevel.INFO))
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel socketChannel) throws Exception {
                        ChannelPipeline pipeline = socketChannel.pipeline();

                        pipeline.addLast(new IdleStateHandler(5 * 60, 0, 0));
                        pipeline.addLast(new HttpServerCodec());
                        pipeline.addLast(new HttpObjectAggregator(65536));
                        pipeline.addLast(new WebSocketHandshakeHandler("/api/v1/netty"));
                        pipeline.addLast(new MessageInboundHandler(redisTemplate));
                    }
                });

        serverBootstrap.bind(port).sync();
    }

    @PreDestroy
    public void destroy(){
        Future<?> future = bossGroup.shutdownGracefully();
        Future<?> future1 = workerGroup.shutdownGracefully();
        future.syncUninterruptibly();
        future1.syncUninterruptibly();
        log.info("关闭 ws server 成功");
    }

}