package com.imhub.contact.data.ApplyList;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class FriendApplicationDTO {
    private String id;
    private String userId;
    private String targetId;
    private String msg;
    private Integer status;
    private String createdAt;
}
