package com.shanyangcode.infinitechat.authenticationservice.controller;

import com.shanyangcode.infinitechat.authenticationservice.common.Result;
import com.shanyangcode.infinitechat.authenticationservice.data.common.email.EmailRequest;
import com.shanyangcode.infinitechat.authenticationservice.data.common.email.EmailResponse;
import com.shanyangcode.infinitechat.authenticationservice.data.common.uploadUrl.UploadUrlRequest;
import com.shanyangcode.infinitechat.authenticationservice.data.common.uploadUrl.UploadUrlResponse;
import com.shanyangcode.infinitechat.authenticationservice.service.CommonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

@RestController
@Slf4j
@RequestMapping("/api/v1/user/common")
public class CommonController {
    @Resource
    private CommonService commonService;

    @GetMapping({"/email", "/sms"})
    public Result<EmailResponse> sendEmailCode(@Valid EmailRequest request) throws Exception {
        EmailResponse response = commonService.sendEmailCode(request);

        return Result.OK(response);
    }

    @GetMapping("/uploadUrl")
    public Result<UploadUrlResponse> getUploadUrl(@Valid UploadUrlRequest request) throws Exception {
        UploadUrlResponse response = commonService.uploadUrl(request);

        return Result.OK(response);
    }
}