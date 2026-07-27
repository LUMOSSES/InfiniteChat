package com.imhub.messaging.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.imhub.messaging.model.Friend;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FriendMapper extends BaseMapper<Friend> {
    /**
     * 检查好友关系
     * @param userId 用户id
     * @param friendId 朋友id
     * @return
     */
    @Select("SELECT * FROM friend WHERE user_id = #{userId} AND friend_id = #{friendId} AND status = 1")
    Friend selectFriendship(@Param("userId") Long userId, @Param("friendId") Long friendId);
}