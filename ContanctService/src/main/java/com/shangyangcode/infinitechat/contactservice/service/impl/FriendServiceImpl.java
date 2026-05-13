package com.shangyangcode.infinitechat.contactservice.service.impl;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.github.yulichang.wrapper.MPJLambdaWrapper;
import com.shangyangcode.infinitechat.contactservice.constants.ConfigEnum;
import com.shangyangcode.infinitechat.contactservice.constants.FriendServiceConstants;
import com.shangyangcode.infinitechat.contactservice.constants.SessionType;
import com.shangyangcode.infinitechat.contactservice.data.BlockFriend.BlockFriendRequest;
import com.shangyangcode.infinitechat.contactservice.data.BlockFriend.BlockFriendResponse;
import com.shangyangcode.infinitechat.contactservice.data.DeleteFriend.DeleteFriendRequest;
import com.shangyangcode.infinitechat.contactservice.data.DeleteFriend.DeleteFriendResponse;
import com.shangyangcode.infinitechat.contactservice.data.FriendDetail.FriendDetailRequest;
import com.shangyangcode.infinitechat.contactservice.data.FriendDetail.FriendDetailResponse;
import com.shangyangcode.infinitechat.contactservice.data.ModifyApply.ModifyApplyResponse;
import com.shangyangcode.infinitechat.contactservice.data.SearchUser.SearchByKeywordRequest;
import com.shangyangcode.infinitechat.contactservice.data.SearchUser.SearchUserRequest;
import com.shangyangcode.infinitechat.contactservice.data.SearchUser.SearchUserResponse;
import com.shangyangcode.infinitechat.contactservice.data.dto.push.NewSessionNotification;
import com.shangyangcode.infinitechat.contactservice.exception.ServiceException;
import com.shangyangcode.infinitechat.contactservice.mapper.ApplyFriendMapper;
import com.shangyangcode.infinitechat.contactservice.mapper.FriendMapper;
import com.shangyangcode.infinitechat.contactservice.mapper.SessionMapper;
import com.shangyangcode.infinitechat.contactservice.mapper.UserSessionMapper;
import com.shangyangcode.infinitechat.contactservice.model.*;
import com.shangyangcode.infinitechat.contactservice.service.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Select;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class FriendServiceImpl extends ServiceImpl<FriendMapper, Friend> implements FriendService {
    @Autowired
    private UserService userService;

    @Autowired
    private UserSessionMapper userSessionMapper;

    @Autowired
    private SessionMapper sessionMapper;

    @Autowired
    private ApplyFriendMapper applyFriendMapper;

    @Autowired
    private PushService pushService;

    private final Snowflake snowflake = IdUtil.getSnowflake(
            Integer.parseInt(ConfigEnum.WORKED_ID.getValue()),
            Integer.parseInt(ConfigEnum.DATACENTER_ID.getValue())
    );

    @Override
    public SearchUserResponse searchUser(SearchUserRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("phone", request.getPhone());

        User user = userService.getOne(queryWrapper);
        if (user == null) {
            throw new ServiceException(FriendServiceConstants.USER_NOT_EXIST);
        }

        validateFriendUser(user);

        SearchUserResponse response = new SearchUserResponse()
            .setUserId(String.valueOf(user.getUserId()))
            .setUserName(user.getUserName())
            .setAvatar(user.getAvatar())
            .setEmail(user.getEmail())
            .setPhone(user.getPhone())
            .setSignature(user.getSignature())
            .setGender(user.getGender());

        populateSessionId(Long.valueOf(request.getUserUuid()), user.getUserId(), response);
        response.setStatus(populateFriendStatus(Long.valueOf(request.getUserUuid()), user.getUserId()));
//这两行是在告诉前端"我和被搜索用户目前是什么关系、是否已有聊天会话"，方便前端决定显示"加好友"还是"直接聊天"。
        return response;
    }

    private void validateFriendUser(User friendUser) {
        //检查被搜索的用户是否处于被封禁或已删除状态，如果是，则抛出异常，告知前端该用户不可添加为好友。
        switch (friendUser.getStatus()) {
            case FriendServiceConstants.USER_STATUS_BANNED:
                throw new ServiceException(FriendServiceConstants.USER_BANNED);
            case FriendServiceConstants.USER_STATUS_DELETED:
                throw new ServiceException(FriendServiceConstants.USER_DELETED);
            default:
                break;
        }
    }

    private void populateSessionId(Long userId, Long friendId, SearchUserResponse response) {
        //查询用户和被搜索用户之间是否已经有单聊会话，如果有，返回会话ID；如果没有，返回null
        List<Long> commonSessionIds = userSessionMapper.findCommonSingleChatSessionIds(userId, friendId);
        //如果commonSessionIds为空，说明没有单聊会话，返回null；如果不为空，说明有单聊会话，返回第一个会话ID
        // （理论上应该只有一个单聊会话）
        if (commonSessionIds == null || commonSessionIds.isEmpty()) {
            response.setSessionId(null);
        } else {
            response.setSessionId(String.valueOf(commonSessionIds.get(0)));
        }
    }

    private int populateFriendStatus(Long userId, Long friendId) {
        //查询用户和被搜索用户之间的好友关系状态，如果没有好友关系，返回0；
        // 如果有好友关系，返回对应的状态值（例如1表示正常好友，2表示被拉黑等）
        QueryWrapper<Friend> wrapper = new QueryWrapper<>();
        wrapper.eq("friend_id", friendId)
                .eq("user_id", userId); 
        Friend friend = this.getOne(wrapper);//查询用户和被搜索用户之间的好友关系
        if (friend != null) {
            return friend.getStatus();
        } else {
            return FriendServiceConstants.FRIEND_STATUS_NON_FRIEND;
        }
    }


    @Override
    public List<SearchUserResponse> searchByKeyword(SearchByKeywordRequest request) {
        String keyword = request.getKeyword();
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }

        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("email", keyword)
                .or().like("user_name", keyword)
                .or().like("phone", keyword);

        List<User> users = userService.list(queryWrapper);

        List<SearchUserResponse> results = new ArrayList<>();
        for (User user : users) {
            validateFriendUser(user);
            SearchUserResponse response = new SearchUserResponse()
                .setUserId(String.valueOf(user.getUserId()))
                .setUserName(user.getUserName())
                .setAvatar(user.getAvatar())
                .setEmail(user.getEmail())
                .setPhone(user.getPhone())
                .setSignature(user.getSignature())
                .setGender(user.getGender());
            populateSessionId(Long.valueOf(request.getUserUuid()), user.getUserId(), response);
            response.setStatus(populateFriendStatus(Long.valueOf(request.getUserUuid()), user.getUserId()));
            results.add(response);
        }
        return results;
    }

    @Override
    public List<SearchUserResponse> getFriendList(String userUuid) {
        QueryWrapper<Friend> friendQuery = new QueryWrapper<>();
        friendQuery.eq("user_id", Long.valueOf(userUuid))
                .eq("status", FriendServiceConstants.FRIEND_STATUS_ACTIVE);
        List<Friend> friendRecords = this.list(friendQuery);

        List<SearchUserResponse> results = new ArrayList<>();
        for (Friend f : friendRecords) {
            User friendUser = userService.getById(f.getFriendId());
            if (friendUser == null) continue;
            SearchUserResponse response = new SearchUserResponse()
                .setUserId(String.valueOf(friendUser.getUserId()))
                .setUserName(friendUser.getUserName())
                .setAvatar(friendUser.getAvatar())
                .setEmail(friendUser.getEmail())
                .setPhone(friendUser.getPhone())
                .setSignature(friendUser.getSignature())
                .setGender(friendUser.getGender());
            populateSessionId(Long.valueOf(userUuid), friendUser.getUserId(), response);
            response.setStatus(populateFriendStatus(Long.valueOf(userUuid), friendUser.getUserId()));
            results.add(response);
        }
        return results;
    }

    @Override
    @Transactional//把一个方法里的多次数据库操作当成一个"整体事务"执行，要么全部成功，要么全部失败，保证数据一致性。
    public DeleteFriendResponse deleteFriend(DeleteFriendRequest request){
    //删除好友接口，接收一个DeleteFriendRequest对象，包含发起删除好友请求的用户UUID和被删除好友的UUID。
        Long userId = request.getUserUuid();
        Long friendId = request.getReceiveUserUuid();

        deleteApplyFriendRecords(userId, friendId);//删除好友申请记录，防止在好友关系删除后仍然存在相关的好友申请记录。
        deleteFriendRecords(userId, friendId);//删除好友关系记录，彻底移除用户和被删除好友之间的好友关系。
        deleteSessionRecords(userId, friendId);//删除会话记录，确保用户和被删除好友之间的聊天会话也被删除，防止用户在删除好友后仍然能够访问之前的聊天记录。

        return new DeleteFriendResponse().setMessage("删除好友成功");
    }

    private void deleteApplyFriendRecords(Long userId, Long friendId) {
        QueryWrapper<ApplyFriend> applyFriendWrapper = new QueryWrapper<>();
        applyFriendWrapper
                .nested(wrapper -> wrapper.eq("user_id", userId).eq("target_id", friendId))
                //删除用户发起的好友申请记录
                .or()
                .nested(wrapper -> wrapper.eq("user_id", friendId).eq("target_id", userId));
                //删除被删除好友发起的好友申请记录


        applyFriendMapper.delete(applyFriendWrapper);
    }

    private void deleteFriendRecords(Long userId, Long friendId) {
        //删除好友关系记录，彻底移除用户和被删除好友之间的好友关系。
        QueryWrapper<Friend> friendWrapper = new QueryWrapper<>();
        friendWrapper
                .nested(wrapper -> wrapper.eq("user_id", userId).eq("friend_id", friendId))
                .or()
                .nested(wrapper -> wrapper.eq("user_id", friendId).eq("friend_id", userId));

        this.remove(friendWrapper);
    }

//    @Select("SELECT s.id " +
//            "FROM session s " +
//            "JOIN user_session us1 ON s.id = us1.session_id AND us1.user_id = #{userId} " +
//            "JOIN user_session us2 ON s.id = us2.session_id AND us2.user_id = #{friendId} " +
//            "WHERE s.type = 1 AND s.status != 2")

    private void deleteSessionRecords(Long userId, Long friendId) {
        //查询用户和被删除好友之间是否存在单聊会话
        // 如果存在，删除相关的会话记录和用户会话记录，确保用户在删除好友后无法访问之前的聊天记录。
        MPJLambdaWrapper<Session> wrapper = new MPJLambdaWrapper<Session>()
                .select(Session::getId)
                .eq(Session::getType, 1)
                .ne(Session::getStatus, 2)
                .leftJoin(UserSession.class, UserSession::getSessionId, Session::getId)
                .leftJoin(UserSession.class, UserSession::getSessionId, Session::getId)
                .eq("t1.user_id", userId)
                .eq("t2.user_id", friendId);

        List<Session> sessions = sessionMapper.selectJoinList(Session.class, wrapper);
        ArrayList<Long> sessionIdList = new ArrayList<>();

        for(Session session: sessions){
            sessionIdList.add(session.getId());
        }

        if(!sessions.isEmpty()){
            QueryWrapper<UserSession> userSessionQueryWrapper = new QueryWrapper<>();
            userSessionQueryWrapper.in("session_id", sessionIdList);

            userSessionMapper.delete(userSessionQueryWrapper);
            sessionMapper.deleteBatchIds(sessionIdList);
        }
    }


    @Override
    @Transactional
    public BlockFriendResponse blockFriend(BlockFriendRequest request) {
        //拉黑好友接口，接收一个BlockFriendRequest对象，包含发起拉黑请求的用户UUID和被拉黑好友的UUID。
        QueryWrapper<Friend> friendQueryWrapper = new QueryWrapper<>();
        friendQueryWrapper
                .eq("user_id", request.getUserUuid())
                .eq("friend_id", request.getReceiveUserUuid());

        Friend friend = this.getOne(friendQueryWrapper);
        if (friend == null){
            throw new ServiceException(FriendServiceConstants.FRIEND_NOT_EXIST);
        }

        friend.setStatus(FriendServiceConstants.FRIEND_STATUS_BLOCKED);
        this.updateById(friend);

        return new BlockFriendResponse().setMessage("拉黑好友成功");
    }


    @Override
    public ModifyApplyResponse addFriend(Long userId, Long friendId) throws Exception {
        User user = userService.getById(userId);
        User applicant = userService.getById(friendId);

        createFriendRelations(userId, friendId);
        Long sessionId = createSession(userId, friendId);
        createUserSessions(userId, friendId, sessionId);
        sendPushNotification(user, friendId, sessionId);

        return buildModifyFriendApplicationResponse(applicant, sessionId);
    }

    private void createFriendRelations(Long userId, Long friendId) {
        Friend friend1 = new Friend();
        friend1.setId(snowflake.nextId());
        friend1.setUserId(userId);
        friend1.setFriendId(friendId);
        friend1.setStatus(FriendServiceConstants.FRIEND_STATUS_ACTIVE);

        Friend friend2 = new Friend();
        friend2.setId(snowflake.nextId());
        friend2.setUserId(friendId);
        friend2.setFriendId(userId);
        friend2.setStatus(FriendServiceConstants.FRIEND_STATUS_ACTIVE);

        boolean save1 = this.save(friend1);
        boolean save2 = this.save(friend2);

        if (!save1 || !save2) {
            throw new ServiceException(FriendServiceConstants.ADD_FRIEND_FAILED);
        }
    }

    private Long createSession(Long userId, Long friendId) {
        Long sessionId = snowflake.nextId();
        Session session = new Session();
        session.setId(sessionId);
        session.setName(FriendServiceConstants.EMPTY_STRING);
        session.setType(SessionType.SINGLE.getValue());
        session.setStatus(FriendServiceConstants.FRIEND_STATUS_ACTIVE);

        int sessionSaved = sessionMapper.insert(session);
        if (sessionSaved <= 0) {
            throw new ServiceException(FriendServiceConstants.CREATE_SESSION_FAILED);
        }
        return sessionId;
    }

    private void createUserSessions(Long userId, Long friendId, Long sessionId) {
        UserSession userSession1 = new UserSession();
        userSession1.setId(snowflake.nextId());
        userSession1.setUserId(userId);
        userSession1.setSessionId(sessionId);
        userSession1.setRole(FriendServiceConstants.USER_ROLE_NORMAL);
        userSession1.setStatus(FriendServiceConstants.FRIEND_STATUS_ACTIVE);

        UserSession userSession2 = new UserSession();
        userSession2.setId(snowflake.nextId());
        userSession2.setUserId(friendId);
        userSession2.setSessionId(sessionId);
        userSession2.setRole(FriendServiceConstants.USER_ROLE_NORMAL);
        userSession2.setStatus(FriendServiceConstants.FRIEND_STATUS_ACTIVE);

        int userSessionSaved1 = userSessionMapper.insert(userSession1);
        int userSessionSaved2 = userSessionMapper.insert(userSession2);
        if (userSessionSaved1 <= 0 || userSessionSaved2 <= 0) {
            throw new ServiceException(FriendServiceConstants.CREATE_USER_SESSION_FAILED);
        }
    }

    private void sendPushNotification(User recipient, Long friendId, Long sessionId) throws Exception {
        NewSessionNotification notification = new NewSessionNotification();
        notification.setUserId(String.valueOf(recipient.getUserId()));
        notification.setSessionId(String.valueOf(sessionId));
        notification.setSessionType(SessionType.SINGLE.getValue());
        notification.setSessionName(recipient.getUserName());
        notification.setAvatar(recipient.getAvatar());

        pushService.pushNewSession(friendId, notification);
    }

    private ModifyApplyResponse buildModifyFriendApplicationResponse(User applicant, Long sessionId) {
        ModifyApplyResponse response = new ModifyApplyResponse();
        response.setUserId(String.valueOf(applicant.getUserId()));
        response.setSessionId(String.valueOf(sessionId));
        response.setSessionType(SessionType.SINGLE.getValue());
        response.setSessionName(applicant.getUserName());
        response.setAvatar(applicant.getAvatar());
        return response;
    }

    @Override
    public FriendDetailResponse getFriendDetails(FriendDetailRequest request) {

        User friendUser = userService.getById(request.getFriendUuid());
        validateFriendUser(friendUser);

        FriendDetailResponse response = new FriendDetailResponse();
        response.setUserId(String.valueOf(friendUser.getUserId()))
            .setUserName(friendUser.getUserName())
            .setAvatar(friendUser.getAvatar())
            .setEmail(friendUser.getEmail())
            .setPhone(friendUser.getPhone())
            .setSignature(friendUser.getSignature())
            .setGender(friendUser.getGender())
            .setSessionId(populateSessionId(request.getUserUuid(), request.getFriendUuid()))
                .setStatus(populateFriendStatus(request.getUserUuid(), request.getFriendUuid()));

        return response;
    }


    private String populateSessionId(Long userId, Long friendId) {
        List<Long> commonSessionIds = userSessionMapper.findCommonSingleChatSessionIds(userId, friendId);
        if (commonSessionIds == null || commonSessionIds.isEmpty()) {
            return "0";
        } else {
            return String.valueOf(commonSessionIds.get(0));
        }
    }

}