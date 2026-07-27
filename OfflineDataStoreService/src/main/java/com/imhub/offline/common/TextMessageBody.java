package com.imhub.offline.common;

import lombok.Data;

@Data
public class TextMessageBody {
    private String content;
    private Long replyId;
}
