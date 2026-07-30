package com.threadora.moment.data.getMomentList;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class MomentUserVO {
    private String userId;
    private String userName;
    private String avatar;
}
