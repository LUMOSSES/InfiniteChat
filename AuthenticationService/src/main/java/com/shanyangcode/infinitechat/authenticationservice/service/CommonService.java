package com.shanyangcode.infinitechat.authenticationservice.service;

import com.shanyangcode.infinitechat.authenticationservice.data.common.email.EmailRequest;
import com.shanyangcode.infinitechat.authenticationservice.data.common.email.EmailResponse;
import com.shanyangcode.infinitechat.authenticationservice.data.common.uploadUrl.UploadUrlRequest;
import com.shanyangcode.infinitechat.authenticationservice.data.common.uploadUrl.UploadUrlResponse;

public interface CommonService {
    EmailResponse sendEmailCode(EmailRequest request) throws Exception;

    UploadUrlResponse uploadUrl(UploadUrlRequest request) throws Exception;
}