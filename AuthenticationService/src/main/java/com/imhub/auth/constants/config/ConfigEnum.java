package com.imhub.auth.constants.config;

import lombok.Getter;

@Getter
public enum ConfigEnum {
    TOKEN_SECRET_KEY("tokenSecretKey","K7mXp2Nq9Rs4Wv6Yz1Bc3De5Fg8Hj0LpMn3Tc5Vr7Xy9Za2C4E6Gt8Ih1Kl0Oq");


    private final String value;
    private final String text;

    ConfigEnum(String text, String value){
        this.text = text;
        this.value = value;
    }
}