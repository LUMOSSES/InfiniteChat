package com.imhub.realtime.model;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class TextMessage extends Message {

    private TextMessageBody body;

    @Override
    public String toString() {
        return super.toString();
    }
}
