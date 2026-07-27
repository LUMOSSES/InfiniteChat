package com.imhub.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.imhub.contact.data.AddFriend.AddFriendRequest;
import com.imhub.contact.data.AddFriend.AddFriendResponse;
import com.imhub.contact.data.ApplyList.ApplyListRequest;
import com.imhub.contact.data.ApplyList.ApplyListResponse;
import com.imhub.contact.data.ModifyApply.ModifyApplyRequest;
import com.imhub.contact.data.ModifyApply.ModifyApplyResponse;
import com.imhub.contact.data.UnreadApply.UnreadApplyRequest;
import com.imhub.contact.data.UnreadApply.UnreadApplyResponse;
import com.imhub.contact.data.ApplyList.FriendApplicationDTO;
import com.imhub.contact.model.ApplyFriend;

import java.util.List;

public interface ApplyFriendService extends IService<ApplyFriend> {
    /**
     * 添加好友
     */
    AddFriendResponse addFriend(String userUuid, String receiveUserUuid, AddFriendRequest request) throws Exception;

    /**
     * 获取好友申请列表
     */
    ApplyListResponse getApplyList(ApplyListRequest request);

    UnreadApplyResponse getUnreadApply(UnreadApplyRequest request);

    ModifyApplyResponse modifyApply(ModifyApplyRequest request) throws Exception;

    List<FriendApplicationDTO> getApplyList(String userUuid);

    void acceptApply(String userUuid, String applyId) throws Exception;

    void rejectApply(String userUuid, String applyId);
}