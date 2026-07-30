package com.threadora.realtime.data.ReceiveMessage;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class ReceiveMessageResponse {
    private Long messageId;
}