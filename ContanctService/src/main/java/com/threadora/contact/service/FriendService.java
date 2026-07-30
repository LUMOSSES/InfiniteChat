package com.threadora.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.contact.data.BlockFriend.BlockFriendRequest;
import com.threadora.contact.data.BlockFriend.BlockFriendResponse;
import com.threadora.contact.data.DeleteFriend.DeleteFriendRequest;
import com.threadora.contact.data.DeleteFriend.DeleteFriendResponse;
import com.threadora.contact.data.FriendDetail.FriendDetailRequest;
import com.threadora.contact.data.FriendDetail.FriendDetailResponse;
import com.threadora.contact.data.ModifyApply.ModifyApplyResponse;
import com.threadora.contact.data.SearchUser.SearchUserRequest;
import com.threadora.contact.data.SearchUser.SearchUserResponse;
import com.threadora.contact.model.Friend;

import com.threadora.contact.data.SearchUser.SearchByKeywordRequest;

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