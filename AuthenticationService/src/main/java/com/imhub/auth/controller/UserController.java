package com.imhub.auth.controller;

import com.imhub.auth.common.Result;
import com.imhub.auth.data.user.login.LoginRequest;
import com.imhub.auth.data.user.login.LoginResponse;
import com.imhub.auth.data.user.loginCode.LoginCodeRequest;
import com.imhub.auth.data.user.loginCode.LoginCodeResponse;
import com.imhub.auth.data.user.register.RegisterRequest;
import com.imhub.auth.data.user.register.RegisterResponse;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarRequest;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarResponse;
import com.imhub.auth.service.UserService;
import com.imhub.auth.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

@RestController
@Slf4j
@RequestMapping("/api/v1/user")
public class UserController {
    @Resource
    private UserService userService;

    @PostMapping("/register")
    public Result<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) throws InterruptedException {
        RegisterResponse response = userService.register(request);

        return Result.OK(response);
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request){
        LoginResponse response = userService.login(request);

        return Result.OK(response);
    }

    @PostMapping("/loginCode")
    public Result<LoginCodeResponse> loginCode(@Valid @RequestBody LoginCodeRequest request){
        LoginCodeResponse response = userService.loginCode(request);

        return Result.OK(response);
    }

    @PatchMapping("/avatar")
    public Result<UpdateAvatarResponse> updateAvatar(@Valid @RequestBody UpdateAvatarRequest request,
                                                     @RequestHeader String Authorization) throws Exception {
        String id = JwtUtil.parse(Authorization).getSubject();
        UpdateAvatarResponse response = userService.updateAvatar(id, request);

        return Result.OK(response);
    }
}

