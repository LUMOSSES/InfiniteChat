package com.imhub.contact.data.GetGroupMembers;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class GroupMembersRequest {
    @NotNull(message = "sessionId不能为空")
    private Long sessionId;
}
