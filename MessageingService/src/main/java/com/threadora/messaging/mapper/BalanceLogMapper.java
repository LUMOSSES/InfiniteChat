package com.threadora.messaging.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.threadora.messaging.model.BalanceLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 余额变动记录表 Mapper 接口
 */
@Mapper
public interface BalanceLogMapper extends BaseMapper<BalanceLog> {
}