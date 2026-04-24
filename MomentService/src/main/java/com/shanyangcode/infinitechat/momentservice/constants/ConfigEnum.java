package com.shanyangcode.infinitechat.momentservice.constants;

public enum ConfigEnum {
    SMS_ACCESS_KEY_ID("LTAI5t9w4h8x2HkQuBnrxWV9"),
    SMS_ACCESS_KEY_SECRET("NXKO23aTAdWhJMKosJPo0HTJXkR5yn"),
    SMS_SIG_NAME("无夕教育科技"),
    SMS_TEMPLATE_CODE("SMS_471490089"),
    TOKEN_SECRET_KEY("goat"),
    PASSWORD_SALT("goat"),
    WX_STATE("goat"),
    WORKED_ID("1"),
    DATACENTER_ID("1"),
    IMAGE_URI("http://118.25.77.201:9000/infinitec-chat/"),
    IMAGE_PATH("/home/img/avatar"),
    NOTICE_URL("/api/v1/message/push/moment"),
    MEDIA_TYPE("application/json; charset=utf-8"),
    MINIO_SERVER_URL("http://118.25.77.201:9000"),
    MINIO_ACCESS_KEY("minioadmin"),
    MINIO_SECRET_KEY("minioadmin"),
    REQUEST_SUCCESSFUL("请求成功"),
    MINIO_BUCKET_NAME("infinitec-chat");

    private final String value;

    ConfigEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
