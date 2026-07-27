package com.imhub.contact.constants;

public enum ConfigEnum {
    MEDIA_TYPE("application/json; charset=utf-8"),
    WORKED_ID("1"),
    DATACENTER_ID("1"),
    GROUP_AVATAR_URL("http://127.0.0.1:9000/imhub/avatar/group_avatar.jpg"),
    REQUEST_SUCCESSFUL("ok"),
    OPTION_FAILURE("operation failed");


    private final String value;

    ConfigEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
