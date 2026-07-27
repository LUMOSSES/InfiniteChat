package com.imhub.messaging;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "com.imhub.messaging.feign")
@EnableDiscoveryClient
@SpringBootApplication
@MapperScan("com.imhub.messaging.mapper")
public class MessageingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessageingServiceApplication.class, args);
    }

}
