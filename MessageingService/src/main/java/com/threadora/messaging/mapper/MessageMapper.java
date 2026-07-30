package com.threadora.messaging.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.threadora.messaging.model.Message;
import org.apache.ibatis.annotations.Mapper;

/*** @description 针对表【message】的数据库操作Mapper
* @createDate 2024-11-11 14:37:36
* @Entity generator.domain.Message
*/
@Mapper
public interface MessageMapper extends BaseMapper<Message> {

}




