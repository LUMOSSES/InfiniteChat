package com.imhub.auth.service.impl;

import com.imhub.auth.constants.config.OSSConstant;
import com.imhub.auth.constants.user.registerConstant;
import com.imhub.auth.data.common.email.EmailRequest;
import com.imhub.auth.data.common.email.EmailResponse;
import com.imhub.auth.data.common.uploadUrl.UploadUrlRequest;
import com.imhub.auth.data.common.uploadUrl.UploadUrlResponse;
import com.imhub.auth.service.CommonService;
import com.imhub.auth.utils.EmailUtil;
import com.imhub.auth.utils.OSSUtils;
import com.imhub.auth.utils.RandomNumUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class CommonServiceImpl implements CommonService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private OSSUtils ossUtils;

    @Autowired
    private EmailUtil emailUtil;

    @Override
    public EmailResponse sendEmailCode(EmailRequest request) {
        String email = request.getEmail();
        String code = RandomNumUtil.getRandomNum();

        redisTemplate.opsForValue().set(registerConstant.REGISTER_CODE + email, code, 5, TimeUnit.MINUTES);
        emailUtil.sendVerifyCode(email, code);

        return new EmailResponse().setEmail(email);
    }

    @Override
    public UploadUrlResponse uploadUrl(UploadUrlRequest request) throws Exception {
        String fileName = request.getFileName();

        String uploadUrl = ossUtils.uploadUrl(OSSConstant.BUCKET_NAME, fileName, OSSConstant.PICTURE_EXPIRE_TIME);
        String downUrl = ossUtils.downUrl(OSSConstant.BUCKET_NAME, fileName);

        UploadUrlResponse response = new UploadUrlResponse();
        response.setUploadUrl(uploadUrl)
                .setDownloadUrl(downUrl);

        return response;
    }
}