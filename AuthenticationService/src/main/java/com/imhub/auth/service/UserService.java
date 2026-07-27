package com.imhub.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.imhub.auth.data.user.login.LoginRequest;
import com.imhub.auth.data.user.login.LoginResponse;
import com.imhub.auth.data.user.loginCode.LoginCodeRequest;
import com.imhub.auth.data.user.loginCode.LoginCodeResponse;
import com.imhub.auth.data.user.register.RegisterRequest;
import com.imhub.auth.data.user.register.RegisterResponse;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarRequest;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarResponse;
import com.imhub.auth.model.User;
import com.baomidou.mybatisplus.extension.service.IService;

public interface UserService extends IService<User> {
    default User getOnly(QueryWrapper<User> wrapper, boolean throwEx){
        wrapper.last("limit 1");

        return this.getOne(wrapper, throwEx);
    }

    RegisterResponse register(RegisterRequest request) throws InterruptedException;

    LoginResponse login(LoginRequest request);

    LoginCodeResponse loginCode(LoginCodeRequest request);

    UpdateAvatarResponse updateAvatar(String id, UpdateAvatarRequest request);
}
