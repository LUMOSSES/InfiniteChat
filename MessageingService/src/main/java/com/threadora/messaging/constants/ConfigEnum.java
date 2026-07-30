package com.threadora.messaging.constants;

import org.apache.commons.lang3.ObjectUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum ConfigEnum {

    SMS_ACCESS_KEY_ID("smsAccessKeyId", "PLACEHOLDER_SMS_KEY_ID"),
    SMS_ACCESS_KEY_SECRET("smsAccessKeySecret","PLACEHOLDER_SMS_KEY_SECRET"),
    SMS_SIG_NAME("smsSigName","Threadora"),
    SMS_TEMPLATE_CODE("smsTemplateCode","SMS_PLACEHOLDER"),
    TOKEN_SECRET_KEY("tokenSecretKey","K7mXp2Nq9Rs4Wv6Yz1Bc3De5Fg8Hj0LpMn3Tc5Vr7Xy9Za2C4E6Gt8Ih1Kl0Oq"),
    PASSWORD_SALT("passwordSalt","S4Lt_7xK#mP2@qR9"),
    WX_STATE("wxState","StAtE_8f3DkLp2Xz"),
    WORKED_ID("workedId","1"),
    DATACENTER_ID("DATACENTER_ID","1"),
    IMAGE_URI("imageUri","http://127.0.0.1:9000/threadora/avatar/"),
    MEDIA_TYPE("mediaType","application/json; charset=utf-8"),
    MSG_URL("msgUrl","/api/v1/message/user/"),
    KAFKA_TOPICS("kafkaTopics","threadora_message"),
    HTTP_CONFIG("httpConfig","application/json; charset=utf-8"),
    IMAGE_PATH("imagePath", "/home/img/avatar/");

    private final String text;

    private final String value;

    ConfigEnum(String text, String value) {
        this.text = text;
        this.value = value;
    }


    public static List<String> getValues() {
          return Arrays.stream(ConfigEnum.values()).map(ConfigEnum::getValue).collect(Collectors.toList());
    }


    public static ConfigEnum getEnumByValue(String value) {
        if (ObjectUtils.isEmpty(value)) {
            return null;
        }
        for (ConfigEnum anEnum : ConfigEnum.values()) {
            if (anEnum.getValue().equals(value)) {
                return anEnum;
            }

        }
        return null;
    }
    public String getText() {
        return text;
    }


    public String getValue() {
        return value;
    }


}
