package com.threadora.contact.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.threadora.contact.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}