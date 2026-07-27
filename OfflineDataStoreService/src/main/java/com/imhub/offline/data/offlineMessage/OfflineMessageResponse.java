package com.imhub.offline.data.offlineMessage;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class OfflineMessageResponse {

    private List<OfflineMessage> offlineMessages;
}