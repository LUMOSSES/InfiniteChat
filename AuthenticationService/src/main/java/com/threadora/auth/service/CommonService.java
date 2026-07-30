package com.threadora.auth.service;

import com.threadora.auth.data.common.email.EmailRequest;
import com.threadora.auth.data.common.email.EmailResponse;
import com.threadora.auth.data.common.uploadUrl.UploadUrlRequest;
import com.threadora.auth.data.common.uploadUrl.UploadUrlResponse;

public interface CommonService {
    EmailResponse sendEmailCode(EmailRequest request) throws Exception;

    UploadUrlResponse uploadUrl(UploadUrlRequest request) throws Exception;
}