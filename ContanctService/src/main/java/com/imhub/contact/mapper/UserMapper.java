package com.imhub.contact.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.imhub.contact.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}