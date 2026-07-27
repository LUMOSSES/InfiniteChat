package com.imhub.moment.service;

import cn.hutool.log.Log;
import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.moment.model.Friend;

import java.util.List;

public interface FriendService extends IService<Friend> {
    List<Long> getFriendIds(Long userId);
}