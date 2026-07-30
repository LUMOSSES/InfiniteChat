package com.threadora.contact.service;

import com.threadora.contact.data.AddFriend.FriendApplicationNotification;
import com.threadora.contact.data.dto.push.NewGroupSessionNotification;
import com.threadora.contact.data.dto.push.NewSessionNotification;

public interface PushService {

    /**
     * 推送好友申请
     *
     * @param userId
     * @param notification
     * @throws Exception
     */
    void pushNewApply(Long userId, FriendApplicationNotification notification) throws Exception;

    void pushGroupNewSession(Long userId, NewGroupSessionNotification notification) throws Exception;

    void pushNewSession(Long userId, NewSessionNotification notification) throws Exception;

}