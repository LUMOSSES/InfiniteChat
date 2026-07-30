package com.threadora.auth;

import com.threadora.auth.model.User;
import com.threadora.auth.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AuthenticationServiceApplicationTests {
    @Autowired
    private UserService userService;

    @Test
    void contextLoads() {
    }

    @Test
    void testUserService(){
        User user = userService.getById(1);
        System.out.println(user);
    }


}
