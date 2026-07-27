package com.imhub.realtime.model;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class AckData {

    private Long sessionId;

    private Long receiveUserUuid;

    private String msgUuid;
}
