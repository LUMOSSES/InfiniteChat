package com.shangyangcode.infinitechat.contactservice.data.SearchUser;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;

@Data
@Accessors(chain = true)
public class SearchByKeywordRequest {
    @NotNull(message = "发起人不能为空")
    private String userUuid;

    private String keyword;
}
