package com.imhub.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.contact.data.BlockFriend.BlockFriendRequest;
import com.imhub.contact.data.BlockFriend.BlockFriendResponse;
import com.imhub.contact.data.DeleteFriend.DeleteFriendRequest;
import com.imhub.contact.data.DeleteFriend.DeleteFriendResponse;
import com.imhub.contact.data.FriendDetail.FriendDetailRequest;
import com.imhub.contact.data.FriendDetail.FriendDetailResponse;
import com.imhub.contact.data.ModifyApply.ModifyApplyResponse;
import com.imhub.contact.data.SearchUser.SearchUserRequest;
import com.imhub.contact.data.SearchUser.SearchUserResponse;
import com.imhub.contact.model.Friend;

import com.imhub.contact.data.SearchUser.SearchByKeywordRequest;

import java.util.List;

public interface FriendService extends IService<Friend> {
    SearchUserResponse searchUser(SearchUserRequest request);

    List<SearchUserResponse> searchByKeyword(SearchByKeywordRequest request);

    List<SearchUserResponse> getFriendList(String userUuid);

    DeleteFriendResponse deleteFriend(DeleteFriendRequest request);

    BlockFriendResponse blockFriend(BlockFriendRequest request);

    ModifyApplyResponse addFriend(Long userId, Long friendId) throws Exception;

    FriendDetailResponse getFriendDetails(FriendDetailRequest request);
}