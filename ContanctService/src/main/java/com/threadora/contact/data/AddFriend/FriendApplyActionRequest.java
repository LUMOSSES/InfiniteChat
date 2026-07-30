package com.threadora.contact.data.AddFriend;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class FriendApplyActionRequest {
    @NotNull(message = "用户不能为空")
    private String userUuid;

    @NotNull(message = "申请ID不能为空")
    private String applyId;
}
