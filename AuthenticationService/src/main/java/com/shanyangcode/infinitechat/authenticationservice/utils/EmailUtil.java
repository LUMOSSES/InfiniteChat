package com.shanyangcode.infinitechat.authenticationservice.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

@Slf4j
@Component
public class EmailUtil {

    @Resource
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerifyCode(String targetEmail, String code) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(targetEmail);
        mailMessage.setSubject("InfiniteChat 验证码");
        mailMessage.setText("您的验证码为: " + code + "，5分钟内有效。如非本人操作请忽略本邮件。");

        mailSender.send(mailMessage);
        log.info("邮箱验证码发送成功, email={}", targetEmail);
    }
}
