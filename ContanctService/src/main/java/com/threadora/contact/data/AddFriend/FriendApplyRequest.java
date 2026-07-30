package com.threadora.contact.data.AddFriend;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class FriendApplyRequest {
    @NotNull(message = "发起人不能为空")
    private String userUuid;

    @NotNull(message = "目标用户不能为空")
    private String targetId;

    private String msg;
}
