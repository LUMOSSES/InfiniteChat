package com.threadora.moment.constants;

public enum ConfigEnum {
    SMS_ACCESS_KEY_ID("PLACEHOLDER_SMS_KEY_ID"),
    SMS_ACCESS_KEY_SECRET("PLACEHOLDER_SMS_KEY_SECRET"),
    SMS_SIG_NAME("Threadora"),
    SMS_TEMPLATE_CODE("SMS_PLACEHOLDER"),
    TOKEN_SECRET_KEY("K7mXp2Nq9Rs4Wv6Yz1Bc3De5Fg8Hj0LpMn3Tc5Vr7Xy9Za2C4E6Gt8Ih1Kl0Oq"),
    PASSWORD_SALT("S4Lt_7xK#mP2@qR9"),
    WX_STATE("StAtE_8f3DkLp2Xz"),
    WORKED_ID("1"),
    DATACENTER_ID("1"),
    IMAGE_URI("http://127.0.0.1:9000/threadora/"),
    IMAGE_PATH("/home/img/avatar"),
    NOTICE_URL("/api/v1/message/push/moment"),
    MEDIA_TYPE("application/json; charset=utf-8"),
    MINIO_SERVER_URL("http://127.0.0.1:9000"),
    MINIO_ACCESS_KEY("minioadmin"),
    MINIO_SECRET_KEY("minioadmin"),
    REQUEST_SUCCESSFUL("ok"),
    MINIO_BUCKET_NAME("threadora");

    private final String value;

    ConfigEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
