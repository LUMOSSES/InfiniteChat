package com.shanyangcode.infinitechat.momentservice.data.deleteLike;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UnlikeMomentRequest {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
}
