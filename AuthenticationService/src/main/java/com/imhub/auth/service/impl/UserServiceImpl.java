package com.imhub.auth.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.lang.Snowflake;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.imhub.auth.constants.user.ErrorEnum;
import com.imhub.auth.data.user.login.LoginRequest;
import com.imhub.auth.data.user.login.LoginResponse;
import com.imhub.auth.data.user.loginCode.LoginCodeRequest;
import com.imhub.auth.data.user.loginCode.LoginCodeResponse;
import com.imhub.auth.data.user.register.RegisterRequest;
import com.imhub.auth.data.user.register.RegisterResponse;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarRequest;
import com.imhub.auth.data.user.updateAvatar.UpdateAvatarResponse;
import com.imhub.auth.exception.CodeException;
import com.imhub.auth.exception.DatabaseException;
import com.imhub.auth.exception.UserException;
import com.imhub.auth.model.User;
import com.imhub.auth.mapper.UserMapper;
import com.imhub.auth.service.UserService;
import com.imhub.auth.utils.JwtUtil;
import com.imhub.auth.utils.NickNameGeneratorUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import cn.hutool.core.util.IdUtil;

import com.imhub.auth.constants.user.registerConstant;
import org.springframework.util.DigestUtils;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        if (isRegister(email)){
            throw new UserException(ErrorEnum.REGISTER_ERROR);
        }

        // 去查redis code == redisCode
        String redisCode = redisTemplate.opsForValue().get(registerConstant.REGISTER_CODE + email);
        if (redisCode == null || !redisCode.equals(request.getCode())){
            throw new CodeException(ErrorEnum.CODE_ERROR);
        }
        // 相等就 存数据库
        Snowflake snowflake = IdUtil.getSnowflake(1, 1);
        String encryptedPassword = DigestUtils.md5DigestAsHex(password.getBytes());

        User user = new User()
                .setUserId(snowflake.nextId())
                .setPassword(encryptedPassword)
            .setEmail(email)
                .setUserName(NickNameGeneratorUtil.generateNickName());

        boolean isUserSave = this.save(user);
        if (!isUserSave){
            throw new DatabaseException("数据库异常，保存用户信息失败");
        }

        return new RegisterResponse().setEmail(email);
    }

    private boolean isRegister(String email){
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);

        long count = this.count(queryWrapper);

        return count > 0;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", request.getEmail());

        User user = this.getOnly(queryWrapper, true);
        String password = DigestUtils.md5DigestAsHex(request.getPassword().getBytes());
        if (user == null || !password.equals(user.getPassword())){
            throw new UserException(ErrorEnum.LOGIN_ERROR);
        }

        LoginResponse response = new LoginResponse();
        BeanUtils.copyProperties(user, response);
        response.setUserId(String.valueOf(user.getUserId()));
        String token = JwtUtil.generate(String.valueOf(user.getUserId()));
        response.setToken(token);
        return response;
    }


    @Override
    public LoginCodeResponse loginCode(LoginCodeRequest request) {
        String redisCode = redisTemplate.opsForValue().get(registerConstant.REGISTER_CODE + request.getEmail());
        if (redisCode == null || !redisCode.equals(request.getCode())) {
            throw new CodeException(ErrorEnum.CODE_ERROR);
        }

        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", request.getEmail());
        User user = this.getOnly(queryWrapper, true);
        if (user == null) {
            throw new UserException(ErrorEnum.LOGIN_ERROR);
        }

        LoginCodeResponse response = new LoginCodeResponse();
        BeanUtil.copyProperties(user, response);

        String token = JwtUtil.generate(response.getUserId());
        response.setToken(token);

        return response;
    }

    @Override
    public UpdateAvatarResponse updateAvatar(String id, UpdateAvatarRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", Long.valueOf(id));
        User user = this.getOnly(queryWrapper, true);
        if (user == null) {
            throw new UserException(ErrorEnum.NO_USER_ERROR);
        }

        user.setAvatar(request.avatarUrl);
        boolean isUpdate = this.updateById(user);
        if (!isUpdate) {
            throw new DatabaseException(ErrorEnum.UPDATE_AVATAR_ERROR);
        }

        UpdateAvatarResponse response = new UpdateAvatarResponse();
        BeanUtil.copyProperties(user, response);

        return response;
    }
}




