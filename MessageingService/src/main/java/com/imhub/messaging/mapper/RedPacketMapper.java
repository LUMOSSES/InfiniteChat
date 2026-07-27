package com.imhub.messaging.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.imhub.messaging.model.RedPacket;
import org.apache.ibatis.annotations.Mapper;

/**
 * 红包主表 Mapper 接口
 */
@Mapper
public interface RedPacketMapper extends BaseMapper<RedPacket> {
}