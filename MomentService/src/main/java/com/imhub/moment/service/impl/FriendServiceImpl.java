package com.imhub.moment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.imhub.moment.mapper.FriendMapper;
import com.imhub.moment.model.Friend;
import com.imhub.moment.service.FriendService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendServiceImpl extends ServiceImpl<FriendMapper, Friend> implements FriendService {
    @Override
    public List<Long> getFriendIds(Long userId) {
        QueryWrapper<Friend> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id",userId);

        List<Friend> friends = this.list(queryWrapper);
        List<Long> friendIds = friends.stream().map(Friend::getFriendId).collect(Collectors.toList());

        return friendIds;
    }
}