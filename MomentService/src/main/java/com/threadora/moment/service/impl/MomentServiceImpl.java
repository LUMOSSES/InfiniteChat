package com.threadora.moment.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.google.gson.Gson;
import com.threadora.moment.Exception.DatabaseException;
import com.threadora.moment.Exception.UserException;
import com.threadora.moment.constants.ConfigEnum;
import com.threadora.moment.constants.ErrorEnum;
import com.threadora.moment.constants.MomentConstants;
import com.threadora.moment.data.createMoment.CreateMomentRequest;
import com.threadora.moment.data.createMoment.CreateMomentResponse;
import com.threadora.moment.data.deleteMoment.DeleteMomentRequest;
import com.threadora.moment.data.deleteMoment.DeleteMomentResponse;
import com.threadora.moment.data.getMomentList.MomentListVO;
import com.threadora.moment.mapper.MomentMapper;
import com.threadora.moment.model.Moment;
import com.threadora.moment.model.MomentComment;
import com.threadora.moment.model.MomentLike;
import com.threadora.moment.model.User;
import com.threadora.moment.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class MomentServiceImpl extends ServiceImpl<MomentMapper, Moment> implements MomentService {
    @Autowired
    private FriendService friendService;

    @Autowired
    private UserService userService;

    @Autowired
    private MomentLikeService momentLikeService;

    @Autowired
    private MomentCommentService momentCommentService;

    @Autowired
    private MomentNotificationService notificationService;

    private final Gson gson = new Gson();

    @Override
    public CreateMomentResponse createMoment(CreateMomentRequest request) throws Exception {
        Long userId = Long.valueOf(request.getUserId());

        return crateMomentWithNotification(userId, request.getText(), request.getMediaUrls());
    }

    private CreateMomentResponse crateMomentWithNotification(Long userId, String text, List<String> mediaUrls) throws Exception {
        // 保存朋友圈
        CreateMomentResponse response = saveMoment(userId, text, mediaUrls);
        // 获取用户头像
        User user = userService.getById(userId);
        String avatar = user != null ? user.getAvatar() : null;

        // 发通知，发送给我的朋友
        List<Long> friendIds = friendService.getFriendIds(userId);

        // 发送朋友圈创建通知
        notificationService.sendMomentCreationNotification(userId, avatar, response.getMomentId(), friendIds);

        return response;
    }

    @Transactional(rollbackFor = Exception.class)
    public CreateMomentResponse saveMoment(Long userId, String text, List<String> urls) {
        // 将URL列表转换为JSON字符串
        String mediaUrls = gson.toJson(urls);

        // 创建朋友圈实体
        Moment moment = createMomentEntity(userId, text, mediaUrls);

        // 保存到数据库
        if (!this.save(moment)) {
            throw new DatabaseException(ErrorEnum.DATABASE_ERROR.getCode(),MomentConstants.ERROR_SAVE_FAILED);
        }

        // 转换为VO对象返回
        return convertToMomentVO(moment, urls);
    }

    private Moment createMomentEntity(Long userId, String text, String mediaUrls) {
        Moment moment = new Moment();

        Snowflake snowflake = createSnowflake();
        moment.setUserId(userId);
        moment.setText(text);
        moment.setMediaUrl(mediaUrls);
        moment.setMomentId(snowflake.nextId());

        return moment;
    }

    private Snowflake createSnowflake() {
        return IdUtil.getSnowflake(
                Integer.parseInt(ConfigEnum.WORKED_ID.getValue()),
                Integer.parseInt(ConfigEnum.DATACENTER_ID.getValue())
        );
    }

    private CreateMomentResponse convertToMomentVO(Moment moment, List<String> urls) {
        CreateMomentResponse response = new CreateMomentResponse();
        BeanUtil.copyProperties(moment, response);
        response.setMediaUrls(urls);
        return response;
    }


    @Override
    public Long getMomentOwnerId(Long momentId) {
        Moment moment = this.getById(momentId);

        return moment != null ? moment.getUserId() : null;
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public DeleteMomentResponse deleteMoment(DeleteMomentRequest request) {
        Moment moment = validateMomentOwnership(request.getMomentId(), request.getUserId());

        deleteAssociatedData(request.getMomentId());
        // 标记为删除状态
        moment.setDeleteTime(new Date());
        moment.setUpdateTime(new Date());

        // 更新朋友圈记录
        QueryWrapper<Moment> queryWrapper = createMomentOwnerQuery(request.getMomentId(), request.getUserId());
        boolean update = this.update(moment, queryWrapper);

        if (!update){
            throw new DatabaseException(ErrorEnum.DATABASE_ERROR.getCode(), ErrorEnum.DATABASE_ERROR.getMessage());
        }


        return new DeleteMomentResponse().setMessage(MomentConstants.DELETE_MOMENT_SUCCESS_MSG);
    }

    private Moment validateMomentOwnership(Long momentId, Long userId) {
        QueryWrapper<Moment> queryWrapper = createMomentOwnerQuery(momentId, userId);
        Moment moment = this.getOne(queryWrapper);

        if (moment == null) {
            throw new UserException(ErrorEnum.DELETE_MOMENT_FAILED_MSG);
        }

        return moment;
    }

    private QueryWrapper<Moment> createMomentOwnerQuery(Long momentId, Long userId) {
        QueryWrapper<Moment> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(MomentConstants.FIELD_MOMENT_ID, momentId)
                .eq(MomentConstants.FIELD_USER_ID, userId);

        return queryWrapper;
    }

    private void deleteAssociatedData(Long momentId) {
        deleteAssociatedLikes(momentId);
        deleteAssociatedComments(momentId);
    }

    // 删除相关点赞方法保持不变
    private void deleteAssociatedLikes(Long momentId) {
        QueryWrapper<MomentLike> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(MomentConstants.FIELD_MOMENT_ID, momentId);

        momentLikeService.remove(queryWrapper);
    }


    private void deleteAssociatedComments(Long momentId) {
        QueryWrapper<MomentComment> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(MomentConstants.FIELD_MOMENT_ID, momentId);

        momentCommentService.remove(queryWrapper);
    }

    @Override
    public List<MomentListVO> getMomentList(Long userId, Integer page, Integer size) {
        // 获取好友ID列表加上自己
        List<Long> visibleUserIds = friendService.getFriendIds(userId);
        visibleUserIds.add(userId);

        // 查询朋友圈 — 按创建时间倒序
        QueryWrapper<Moment> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("user_id", visibleUserIds)
                .isNull("delete_time")
                .orderByDesc("create_time");

        // 分页
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Moment> pageObj =
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size);
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Moment> resultPage =
                this.page(pageObj, queryWrapper);

        List<MomentListVO> result = new ArrayList<>();
        for (Moment moment : resultPage.getRecords()) {
            MomentListVO vo = new MomentListVO();
            vo.setMomentId(String.valueOf(moment.getMomentId()));
            vo.setUserId(String.valueOf(moment.getUserId()));
            vo.setText(moment.getText());
            vo.setCreateTime(moment.getCreateTime() != null ? moment.getCreateTime().toString() : null);

            // 解析 mediaUrl JSON 数组，取第一个
            if (moment.getMediaUrl() != null && !moment.getMediaUrl().isEmpty()) {
                try {
                    String[] urls = gson.fromJson(moment.getMediaUrl(), String[].class);
                    vo.setMediaUrl(urls != null && urls.length > 0 ? urls[0] : null);
                } catch (Exception e) {
                    vo.setMediaUrl(moment.getMediaUrl());
                }
            }

            // 点赞数
            QueryWrapper<MomentLike> likeCountQuery = new QueryWrapper<>();
            likeCountQuery.eq("moment_id", moment.getMomentId()).eq("is_delete", 0);
            vo.setLikeCount((int) momentLikeService.count(likeCountQuery));

            // 评论数
            QueryWrapper<MomentComment> commentCountQuery = new QueryWrapper<>();
            commentCountQuery.eq("moment_id", moment.getMomentId()).eq("is_delete", 0);
            vo.setCommentCount((int) momentCommentService.count(commentCountQuery));

            // 当前用户是否点赞
            QueryWrapper<MomentLike> likedQuery = new QueryWrapper<>();
            likedQuery.eq("moment_id", moment.getMomentId())
                    .eq("user_id", userId)
                    .eq("is_delete", 0);
            vo.setLiked(momentLikeService.count(likedQuery) > 0);

            // 作者信息
            User author = userService.getById(moment.getUserId());
            if (author != null) {
                vo.setUser(new com.threadora.moment.data.getMomentList.MomentUserVO()
                        .setUserId(String.valueOf(author.getUserId()))
                        .setUserName(author.getUserName())
                        .setAvatar(author.getAvatar()));
            }

            result.add(vo);
        }
        return result;
    }
}