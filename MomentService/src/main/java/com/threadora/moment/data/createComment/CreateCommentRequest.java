package com.threadora.moment.data.createComment;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class CreateCommentRequest {
    private Long momentId;

    private MomentCommentDTO momentCommentDTO;
}