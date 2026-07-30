package com.threadora.contact.data.SearchUser;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class SearchUserResponse {
    private String userId;

    private String userName;

    private String avatar;

    private String email;

    private String phone;

    private String signature;

    private Integer gender;

    private Integer status;

    private String sessionId;
}