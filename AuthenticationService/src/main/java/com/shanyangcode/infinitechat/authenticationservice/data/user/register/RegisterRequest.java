package com.shanyangcode.infinitechat.authenticationservice.data.user.register;

import lombok.Data;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;

@Data
public class RegisterRequest {
    @NotEmpty(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotEmpty(message = "密码不能为空")
    @Length(min = 6, max = 16, message = "密码应为 6-16 位")
    // password 密码
    private String password;

    @NotEmpty(message = "验证码不能为空")
    @Length(min = 6, max = 6, message = "验证码应为 6 位")
    //code 验证码
    private String code;
}
