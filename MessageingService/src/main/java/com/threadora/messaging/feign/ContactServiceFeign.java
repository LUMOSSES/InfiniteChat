package com.threadora.messaging.feign;

import com.threadora.messaging.common.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient("ContactService")
public interface ContactServiceFeign {
    @GetMapping("/api/v1/contact/user")
    Result<?> getUser();
}