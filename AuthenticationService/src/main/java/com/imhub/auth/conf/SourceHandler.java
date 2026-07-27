package com.imhub.auth.conf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.imhub.auth.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Slf4j
@Component
class SourceHandler implements HandlerInterceptor {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String header = request.getHeader("X-Request-Source");
        if (!"IMHub-Gateway".equals(header)){
            refuseResult(response);

            return false;
        }

        return true;
    }

    public void refuseResult(HttpServletResponse httpServletResponse) throws Exception{
        httpServletResponse.setContentType("text/html;charset=UTF-8");
        httpServletResponse.setCharacterEncoding("UTF-8");
        httpServletResponse.setStatus(HttpStatus.BAD_REQUEST.value());
        Result<Object> result = new Result<>().setCode(40301).setMsg("非法请求来源");
        httpServletResponse.getWriter().print(OBJECT_MAPPER.writeValueAsString(result));
        httpServletResponse.getWriter().flush();
    }
}