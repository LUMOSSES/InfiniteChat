-- IMHub Database Initialization Script
-- Auto-executes on MySQL container first startup

CREATE DATABASE IF NOT EXISTS `imhub` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `imhub`;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `user_id`    BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'id',
    `user_name`  VARCHAR(64)  NOT NULL                COMMENT '用户昵称',
    `password`   VARCHAR(128) NOT NULL                COMMENT '密码',
    `email`      VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
    `phone`      VARCHAR(32)  DEFAULT NULL            COMMENT '手机号',
    `avatar`     VARCHAR(512) DEFAULT NULL            COMMENT '用户头像',
    `signature`  VARCHAR(256) DEFAULT NULL            COMMENT '个性签名',
    `gender`     TINYINT      DEFAULT 2               COMMENT '性别 0男 1女 2保密',
    `status`     TINYINT      DEFAULT 1               COMMENT '用户状态 1正常 2封禁 3注销',
    `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_email` (`email`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 好友表
CREATE TABLE IF NOT EXISTS `friend` (
    `id`         BIGINT   NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT   NOT NULL COMMENT '用户ID',
    `friend_id`  BIGINT   NOT NULL COMMENT '好友用户ID',
    `status`     TINYINT  DEFAULT 1  COMMENT '1好友 2拉黑 3删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友表';

-- 3. 好友申请表
CREATE TABLE IF NOT EXISTS `apply_friend` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT       NOT NULL COMMENT '申请人ID',
    `target_id`  BIGINT       NOT NULL COMMENT '被申请人ID',
    `msg`        VARCHAR(256) DEFAULT NULL COMMENT '申请消息',
    `status`     TINYINT      DEFAULT 0  COMMENT '0待处理 1同意 2拒绝',
    `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_target_id` (`target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友申请表';

-- 4. 会话表
CREATE TABLE IF NOT EXISTS `session` (
    `id`         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`       VARCHAR(128) DEFAULT NULL COMMENT '名称',
    `type`       TINYINT     DEFAULT 1  COMMENT '类别 1单聊 2群聊',
    `status`     TINYINT     DEFAULT 1  COMMENT '状态 1正常 2删除',
    `created_at` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- 5. 用户-会话关联表
CREATE TABLE IF NOT EXISTS `user_session` (
    `id`         BIGINT   NOT NULL AUTO_INCREMENT COMMENT 'id',
    `user_id`    BIGINT   NOT NULL COMMENT '用户id',
    `session_id` BIGINT   NOT NULL COMMENT '会话id',
    `role`       TINYINT  DEFAULT 3  COMMENT '角色 1群主 2管理员 3普通用户',
    `status`     TINYINT  DEFAULT 1  COMMENT '状态 1正常 2删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_session` (`user_id`, `session_id`),
    KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- 6. 消息表
CREATE TABLE IF NOT EXISTS `message` (
    `message_id`   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '消息id',
    `sender_id`    BIGINT        NOT NULL COMMENT '发送者id',
    `session_id`   BIGINT        NOT NULL COMMENT '会话id',
    `type`         TINYINT       DEFAULT 1  COMMENT '消息类型 1文本 2图片 3文件 4视频 5红包 6表情包',
    `content`      TEXT          DEFAULT NULL COMMENT '消息内容',
    `reply_id`     BIGINT        DEFAULT NULL COMMENT '引用消息id',
    `session_type` TINYINT       DEFAULT 1  COMMENT '会话类型 1单聊 2群聊',
    `created_at`   DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`message_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 7. 红包主表
CREATE TABLE IF NOT EXISTS `red_packet` (
    `red_packet_id`          BIGINT         NOT NULL AUTO_INCREMENT COMMENT '红包ID',
    `sender_id`              BIGINT         NOT NULL COMMENT '发送者用户ID',
    `session_id`             BIGINT         NOT NULL COMMENT '会话ID',
    `red_packet_wrapper_text` VARCHAR(128)  DEFAULT '恭喜发财，大吉大利' COMMENT '红包封面文案',
    `red_packet_type`        TINYINT        DEFAULT 1  COMMENT '红包类型 1普通红包 2拼手气红包',
    `total_amount`           DECIMAL(10,2)  NOT NULL COMMENT '红包总金额',
    `total_count`            INT            NOT NULL COMMENT '红包总个数',
    `remaining_amount`       DECIMAL(10,2)  NOT NULL COMMENT '剩余金额',
    `remaining_count`        INT            NOT NULL COMMENT '剩余个数',
    `status`                 TINYINT        DEFAULT 1  COMMENT '状态 1未领取完 2已领取完 3已过期',
    `created_at`             DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`red_packet_id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='红包主表';

-- 8. 红包领取记录表
CREATE TABLE IF NOT EXISTS `red_packet_receive` (
    `red_packet_receive_id` BIGINT         NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `red_packet_id`         BIGINT         NOT NULL COMMENT '红包ID',
    `receiver_id`           BIGINT         NOT NULL COMMENT '领取者用户ID',
    `amount`                DECIMAL(10,2)  NOT NULL COMMENT '领取金额',
    `received_at`           DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    PRIMARY KEY (`red_packet_receive_id`),
    UNIQUE KEY `uk_packet_receiver` (`red_packet_id`, `receiver_id`),
    KEY `idx_receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='红包领取记录表';

-- 9. 用户余额表
CREATE TABLE IF NOT EXISTS `user_balance` (
    `user_id`    BIGINT         NOT NULL COMMENT '用户ID',
    `balance`    DECIMAL(10,2)  DEFAULT 0.00 COMMENT '余额',
    `updated_at` DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户余额表';

-- 10. 余额变动记录表
CREATE TABLE IF NOT EXISTS `balance_log` (
    `balance_log_id` BIGINT         NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `user_id`        BIGINT         NOT NULL COMMENT '用户ID',
    `amount`         DECIMAL(10,2)  NOT NULL COMMENT '变动金额 正数增加 负数减少',
    `type`           TINYINT        NOT NULL COMMENT '变动类型 1发送红包 2领取红包 3红包退回',
    `related_id`     BIGINT         DEFAULT NULL COMMENT '关联ID(红包ID)',
    `created_at`     DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`balance_log_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='余额变动记录表';

-- 11. 朋友圈表
CREATE TABLE IF NOT EXISTS `moment` (
    `moment_id`   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '朋友圈id',
    `user_id`     BIGINT        NOT NULL COMMENT '用户id',
    `text`        VARCHAR(2048) DEFAULT NULL COMMENT '朋友圈文本内容',
    `media_url`   VARCHAR(1024) DEFAULT NULL COMMENT '朋友圈媒体',
    `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME      DEFAULT NULL COMMENT '逻辑删除时间',
    PRIMARY KEY (`moment_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='朋友圈表';

-- 12. 朋友圈点赞表
CREATE TABLE IF NOT EXISTS `moment_like` (
    `like_id`     BIGINT   NOT NULL AUTO_INCREMENT COMMENT '点赞id',
    `moment_id`   BIGINT   NOT NULL COMMENT '朋友圈id',
    `user_id`     BIGINT   NOT NULL COMMENT '用户id',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_delete`   TINYINT  DEFAULT 0 COMMENT '逻辑删除 0未删除 1删除',
    PRIMARY KEY (`like_id`),
    UNIQUE KEY `uk_moment_user` (`moment_id`, `user_id`),
    KEY `idx_moment_id` (`moment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='朋友圈点赞表';

-- 13. 朋友圈评论表
CREATE TABLE IF NOT EXISTS `moment_comment` (
    `comment_id`        BIGINT        NOT NULL AUTO_INCREMENT COMMENT '评论id',
    `moment_id`         BIGINT        NOT NULL COMMENT '朋友圈id',
    `user_id`           BIGINT        NOT NULL COMMENT '用户id',
    `parent_comment_id` BIGINT        DEFAULT NULL COMMENT '回复的父评论ID',
    `comment`           VARCHAR(1024) NOT NULL COMMENT '评论内容',
    `create_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_delete`         TINYINT       DEFAULT 0 COMMENT '逻辑删除 0未删除 1删除',
    PRIMARY KEY (`comment_id`),
    KEY `idx_moment_id` (`moment_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='朋友圈评论表';
