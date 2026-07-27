package com.imhub.moment.data.deleteLike;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class DeleteLikeResponse {
    /**
     * 操作结果消息
     */
    private String message;
}