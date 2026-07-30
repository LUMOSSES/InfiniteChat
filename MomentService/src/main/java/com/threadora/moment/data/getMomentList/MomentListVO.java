package com.threadora.moment.data.getMomentList;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class MomentListVO {
    private String momentId;
    private String userId;
    private String text;
    private String mediaUrl;
    private String createTime;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean liked;
    private MomentUserVO user;
}
