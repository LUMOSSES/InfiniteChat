package com.shanyangcode.infinitechat.authenticationservice.constants.config;

import lombok.Getter;

@Getter
public enum ConfigEnum {
    TOKEN_SECRET_KEY("tokenSecretKey","goatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoatgoat");


    private final String value;
    private final String text;

    ConfigEnum(String text, String value){
        this.text = text;
        this.value = value;
    }
}