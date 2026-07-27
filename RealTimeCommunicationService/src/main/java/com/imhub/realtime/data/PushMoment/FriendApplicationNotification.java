package com.imhub.realtime.data.PushMoment;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class FriendApplicationNotification {

    private String applyUserName;
}
