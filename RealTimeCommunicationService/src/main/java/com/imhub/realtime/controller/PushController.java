package com.imhub.realtime.controller;

import com.imhub.realtime.common.Result;
import com.imhub.realtime.data.PushMoment.FriendApplicationNotification;
import com.imhub.realtime.data.PushMoment.NewGroupSessionNotification;
import com.imhub.realtime.data.PushMoment.NewSessionNotification;
import com.imhub.realtime.data.PushMoment.PushMomentRequest;
import com.imhub.realtime.service.impl.NettyMessageService;
import com.imhub.realtime.websocket.ChannelManager;
import io.netty.channel.Channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/v1/message/push")
public class PushController {

    @Autowired
    private NettyMessageService nettyMessageService;

    @GetMapping("/online/{userId}")
    public Result<Map<String, Boolean>> checkOnline(@PathVariable String userId) {
        Channel channel = ChannelManager.getChannelByUserId(userId);
        boolean online = channel != null && channel.isActive();
        Map<String, Boolean> result = new HashMap<>();
        result.put("online", online);
        return Result.OK(result);
    }

    @PostMapping("/moment")
    public Result<?> receiveNoticeMoment(@RequestBody PushMomentRequest request){
        nettyMessageService.sendNoticeMoment(request);
        return Result.OK(null);
    }

    @PostMapping("/friendApplication/{userId}")
    public Result<?> pushFriendApplication(
            @PathVariable("userId") String userId,
            @RequestBody FriendApplicationNotification notification
    ) {
        nettyMessageService.sendFriendApplicationNotification(notification, userId);

        return Result.OK("Friend application notification pushed.");
    }

    @PostMapping("/newSession/{userId}")
    public Result pushNewSession(
            @PathVariable("userId") String userId,
            @RequestBody NewSessionNotification notification
    ) {
        nettyMessageService.sendNewSessionNotification(notification, userId);
        return Result.OK("New session notification pushed.");
    }

    @PostMapping("/newGroupSession/{userId}")
    public Result pushNewGroupSession(
            @PathVariable("userId") String userId,
            @RequestBody NewGroupSessionNotification notification
    ) {
        nettyMessageService.sendNewGroupSessionNotification(notification, userId);
        return Result.OK("New Group session notification pushed.");
    }
}