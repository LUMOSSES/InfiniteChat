package com.imhub.auth.service;

import com.imhub.auth.data.common.email.EmailRequest;
import com.imhub.auth.data.common.email.EmailResponse;
import com.imhub.auth.data.common.uploadUrl.UploadUrlRequest;
import com.imhub.auth.data.common.uploadUrl.UploadUrlResponse;

public interface CommonService {
    EmailResponse sendEmailCode(EmailRequest request) throws Exception;

    UploadUrlResponse uploadUrl(UploadUrlRequest request) throws Exception;
}