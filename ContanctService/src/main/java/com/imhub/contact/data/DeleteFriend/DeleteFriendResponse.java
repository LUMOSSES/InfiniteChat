package com.imhub.contact.data.DeleteFriend;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class DeleteFriendResponse {
    private String message;
}