package com.imhub.contact.data.AddFriend;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class AddFriendRequest {
    private String msg;
}