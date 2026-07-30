package com.threadora.realtime.model;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class PictureMessageBody {

    private Integer size;

    private String url;

    private String replyId;
}
