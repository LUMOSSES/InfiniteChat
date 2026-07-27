package com.imhub.contact.data.UnreadApply;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class UnreadApplyResponse {
    private long count;
}