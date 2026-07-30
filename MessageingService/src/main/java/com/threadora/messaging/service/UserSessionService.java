package com.threadora.messaging.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.threadora.messaging.model.UserSession;

import java.util.List;

/*** @description 针对表【user_session】的数据库操作Service
* @createDate 2024-10-17 11:02:09
*/
public interface UserSessionService extends IService<UserSession> {

    /**
     * 通过sessionId得到群聊内的所有用户id
     * @param sessionId
     * @return
     */
    List<Long> getUserIdsBySessionId(Long sessionId);

}
