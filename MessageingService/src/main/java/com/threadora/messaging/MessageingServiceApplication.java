package com.threadora.messaging;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "com.threadora.messaging.feign")
@EnableDiscoveryClient
@SpringBootApplication
@MapperScan("com.threadora.messaging.mapper")
public class MessageingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessageingServiceApplication.class, args);
    }

}
