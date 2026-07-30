package com.threadora.contact.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.contact.data.AddFriend.AddFriendRequest;
import com.threadora.contact.data.AddFriend.AddFriendResponse;
import com.threadora.contact.data.ApplyList.ApplyListRequest;
import com.threadora.contact.data.ApplyList.ApplyListResponse;
import com.threadora.contact.data.ModifyApply.ModifyApplyRequest;
import com.threadora.contact.data.ModifyApply.ModifyApplyResponse;
import com.threadora.contact.data.UnreadApply.UnreadApplyRequest;
import com.threadora.contact.data.UnreadApply.UnreadApplyResponse;
import com.threadora.contact.data.ApplyList.FriendApplicationDTO;
import com.threadora.contact.model.ApplyFriend;

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