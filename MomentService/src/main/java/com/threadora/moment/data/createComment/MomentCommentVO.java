package com.threadora.moment.data.createComment;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class MomentCommentVO {
    private Long commentId;

    private Long momentId;

    private Long userId;

    private String userName;

    private String comment;

    private Long parentCommentId;

    private String parentUserName;

    private String createTime;
}