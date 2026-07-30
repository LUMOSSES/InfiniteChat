package com.threadora.moment.service;

import cn.hutool.log.Log;
import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.moment.model.Friend;

import java.util.List;

public interface FriendService extends IService<Friend> {
    List<Long> getFriendIds(Long userId);
}