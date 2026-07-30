package com.threadora.auth.utils;

import com.threadora.auth.constants.config.ConfigEnum;
import com.threadora.auth.constants.config.TimeOutEnum;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.apache.commons.lang3.StringUtils;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

public class JwtUtil {
    private final static Duration expiration = Duration.ofHours(TimeOutEnum.JWT_TIME_OUT.getTimeOut());

    public static String generate(String userID){
        Date expiryDate = new Date(System.currentTimeMillis() + expiration.toMillis());
        byte[] keyBytes = ConfigEnum.TOKEN_SECRET_KEY.getValue().getBytes(StandardCharsets.UTF_8);
        SecretKeySpec key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS512.getJcaName());

        return Jwts.builder()
                .setSubject(userID)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public static Claims parse(String token) throws JwtException {
        if (StringUtils.isEmpty(token)){
            throw new JwtException("token 为空");
        }

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(ConfigEnum.TOKEN_SECRET_KEY.getValue().getBytes(StandardCharsets.UTF_8))
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims;
    }
}
