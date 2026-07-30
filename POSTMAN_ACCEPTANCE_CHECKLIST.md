# Threadora Postman 验收清单（中文详细版）

本清单基于你当前仓库里的真实 Controller 路径、Gateway 路由和现有 Postman 请求文件整理。

适用范围：

1. 已通过 Docker 启动中间件和 7 个业务服务。
2. 通过 Gateway 统一入口验收（baseUrl 指向 10010）。

## 1. 验收前准备

1. 确认容器状态正常。

   - 基础中间件：nacos、mysql、redis、minio、kafka、zookeeper。
   - 业务服务：authenticationservice、gateway、messagingservice、realtimecommunicationservice、offlinedatastore、contactservice、momentservice。

2. Postman 环境变量。

   - baseUrl = http://localhost:10010
   - token = （先留空，登录后写入）
   - testEmail = user@example.com
   - testPassword = password123
   - testUserId = 1（如果你已有真实用户ID，改成真实值）
   - testSessionId = 1（有真实会话ID时替换）
   - testMomentId = 1（有真实朋友圈ID时替换）

3. 返回体通用判定。

大多数接口使用统一结构：

```json
{
  "code": 200,
  "msg": "...",
  "data": { }
}
```

通过标准（通用）：

1. HTTP 状态码为 200。
2. 业务 code = 200。
3. data 字段符合该接口预期（可为空的接口除外）。

## 2. 建议验收顺序（先核心链路，再分服务）

建议你按下面顺序点请求：

1. Gateway 路由冒烟。
2. AuthenticationService（拿 token）。
3. ContanctService（联系人基础能力）。
4. MessageingService（消息/红包）。
5. RealTimeCommunicationService（推送与收消息）。
6. OfflineDataStoreService（离线消息拉取）。
7. MomentService（朋友圈发帖点赞评论）。

## 3. Gateway 服务（路由层）

服务作用：

1. 统一入口。
2. 按路径转发到下游微服务。
3. 处理跨域和网关层 header。

路由前缀（来自 Gateway 配置）：

1. /api/v1/user/** -> AuthenticationService
2. /api/v1/chat/** -> MessageingService
3. /api/v1/message/** -> RealTimeCommunicationService
4. /api/v1/offline/** -> OfflineDataStoreService
5. /api/v1/contact/** -> ContanctService
6. /api/v1/moment/** -> MomentService

验收接口（冒烟）：

1. GET {{baseUrl}}/api/v1/user/common/email?email={{testEmail}}

作用：验证网关是否能把请求转发到认证服务。

期望：

1. HTTP 200。
2. code=200。
3. data.email={{testEmail}}。

## 4. AuthenticationService（认证服务）

服务作用：

1. 注册、登录、验证码登录。
2. 用户头像更新。
3. 上传地址（MinIO 预签名）下发。

### 4.1 发送邮箱验证码

请求文件：postman/collections/Threadora-API/Common/send-email-code.request.yaml

1. Method: GET
2. URL: {{baseUrl}}/api/v1/user/common/email
3. Query: email={{testEmail}}

接口作用：给邮箱发送验证码。

期望返回：

1. code=200。
2. data.email={{testEmail}}。

### 4.2 发送短信验证码（当前实现与邮箱同处理）

请求文件：postman/collections/Threadora-API/Common/send-sms-code.request.yaml

1. Method: GET
2. URL: {{baseUrl}}/api/v1/user/common/sms
3. Query: email={{testEmail}}

接口作用：兼容短信入口，当前代码中与 /email 共用同一处理逻辑。

期望返回：

1. code=200。
2. data.email={{testEmail}}。

### 4.3 注册

请求文件：postman/collections/Threadora-API/User/register.request.yaml

1. Method: POST
2. URL: {{baseUrl}}/api/v1/user/register
3. Header: Content-Type: application/json
4. Body:

```json
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}",
  "code": "这里填邮箱收到的验证码"
}
```

接口作用：创建用户账号。

期望返回：

1. code=200。
2. data.email={{testEmail}}。

### 4.4 密码登录

请求文件：postman/collections/Threadora-API/User/login.request.yaml

1. Method: POST
2. URL: {{baseUrl}}/api/v1/user/login
3. Body:

```json
{
  "email": "{{testEmail}}",
  "password": "{{testPassword}}"
}
```

接口作用：邮箱+密码登录，签发 token。

期望返回：

1. code=200。
2. data 中包含 userId、userName、token。

动作：

1. 把 data.token 写入 Postman 环境变量 token。

### 4.5 验证码登录

请求文件：postman/collections/Threadora-API/User/login-with-code.request.yaml

1. Method: POST
2. URL: {{baseUrl}}/api/v1/user/loginCode
3. Body:

```json
{
  "email": "{{testEmail}}",
  "code": "最新验证码"
}
```

接口作用：邮箱+验证码登录。

期望返回：

1. code=200。
2. data 中包含 userId、userName、token。

### 4.6 获取上传地址

请求文件：postman/collections/Threadora-API/Common/get-upload-url.request.yaml

1. Method: GET
2. URL: {{baseUrl}}/api/v1/user/common/uploadUrl
3. Query: fileName=example.jpg

接口作用：获取文件上传地址（用于前端直传对象存储）。

期望返回：

1. code=200。
2. data.uploadUrl 非空。
3. data.downloadUrl 非空。

### 4.7 更新头像

请求文件：postman/collections/Threadora-API/User/update-avatar.request.yaml

1. Method: PATCH
2. URL: {{baseUrl}}/api/v1/user/avatar
3. Header:
   - Content-Type: application/json
   - Authorization: {{token}}
4. Body:

```json
{
  "avatarUrl": "https://example.com/avatar.png"
}
```

接口作用：修改当前用户头像。

期望返回：

1. code=200。
2. data.userId 存在。
3. data.avatar 更新为请求值。

## 5. ContanctService（联系人/群组）

服务作用：

1. 用户查询、好友申请、好友关系。
2. 群组创建、邀请、踢人、退群、成员列表。

建议先测 2 个接口（一个无参冒烟，一个带参数查询）：

### 5.1 联系人服务冒烟接口

1. Method: GET
2. URL: {{baseUrl}}/api/v1/contact/user

接口作用：测试接口，返回固定用户数据。

期望返回：

1. code=200。
2. data.avatar 存在。

### 5.2 按手机号查用户

1. Method: GET
2. URL: {{baseUrl}}/api/v1/contact/{{testUserId}}/user?phone=13800000000

接口作用：根据手机号检索可加好友用户信息。

期望返回：

1. HTTP 200。
2. 返回 JSON 包含 code/msg/data。
3. 若号码不存在，允许业务失败码，但不能 500。

扩展可测接口：

1. GET /api/v1/contact/{userUuid}/applyCount
2. GET /api/v1/contact/{userUuid}/apply
3. DELETE /api/v1/contact/{userUuid}/friend/{receiveUserUuid}
4. POST /api/v1/contact/groups

## 6. MessageingService（聊天消息/红包）

服务作用：

1. 发送会话消息。
2. 红包发放、领取、详情查询。
3. 与联系人服务联调（Feign）。

### 6.1 Feign 联调冒烟

1. Method: GET
2. URL: {{baseUrl}}/api/feign

接口作用：验证消息服务到联系人服务的远程调用链路。

期望返回：

1. HTTP 200。
2. code=200。
3. data 中包含联系人服务返回对象。

说明：该接口路径不是 /api/v1/chat 前缀，通常用于内部调试。

### 6.2 发送会话消息

1. Method: POST
2. URL: {{baseUrl}}/api/v1/chat/session
3. Body 示例：

```json
{
  "sessionId": 1,
  "sendUserId": 1,
  "sessionType": 1,
  "type": 1,
  "receiveUserId": 2,
  "body": {
    "text": "hello"
  }
}
```

接口作用：向会话发送消息。

期望返回：

1. code=200。
2. data 非空（包含消息处理结果）。

### 6.3 发红包（可选）

1. Method: POST
2. URL: {{baseUrl}}/api/v1/chat/redPacket/send
3. Body 示例：

```json
{
  "sessionId": 1,
  "receiveUserId": 2,
  "sendUserId": 1,
  "type": 1,
  "sessionType": 1,
  "body": {
    "redPacketType": 1,
    "totalAmount": 10.00,
    "totalCount": 2,
    "redPacketWrapperText": "恭喜发财"
  }
}
```

接口作用：发送红包消息。

期望返回：

1. code=200。
2. data 中包含 redPacketId 或等价标识字段。

## 7. RealTimeCommunicationService（实时推送）

服务作用：

1. 推送通知（动态提醒、好友申请、新会话）。
2. 接收消息并通过 Netty 通道推送给在线用户。

### 7.1 推送动态提醒

1. Method: POST
2. URL: {{baseUrl}}/api/v1/message/push/moment
3. Body 示例：

```json
{
  "receiveUserIds": [1, 2],
  "noticeType": 1,
  "avatar": "https://example.com/a.png",
  "total": 3
}
```

接口作用：向指定用户推送动态通知。

期望返回：

1. code=200。
2. data 允许为空。

### 7.2 接收用户消息

1. Method: POST
2. URL: {{baseUrl}}/api/v1/message/user
3. Body 示例：

```json
{
  "receiveUserIds": [2],
  "sendUserId": "1",
  "sessionId": "1",
  "avatar": "https://example.com/a.png",
  "userName": "tester",
  "type": 1,
  "messageId": "m-001",
  "sessionType": 1,
  "sessionName": "chat",
  "sessionAvatar": "https://example.com/s.png",
  "createdAt": "2026-04-24 10:00:00",
  "body": {
    "text": "hello"
  }
}
```

接口作用：接收业务消息并走实时推送流程。

期望返回：

1. code=200。
2. data 非空（消息处理结果）。

## 8. OfflineDataStoreService（离线消息）

服务作用：

1. 拉取指定用户在指定时间之后的离线消息。

### 8.1 拉取离线消息

1. Method: GET
2. URL: {{baseUrl}}/api/v1/offline/message?userId=1&time=2026-04-24%2000:00:00

接口作用：客户端重连或启动后补拉历史离线消息。

期望返回：

1. HTTP 200。
2. 返回 JSON 包含 code/msg/data。
3. data 中应包含离线消息列表或空列表（不能 500）。

## 9. MomentService（朋友圈）

服务作用：

1. 发表朋友圈。
2. 点赞、取消点赞。
3. 评论、删除评论。

### 9.1 发表朋友圈

1. Method: POST
2. URL: {{baseUrl}}/api/v1/moment
3. Body 示例：

```json
{
  "userId": "1",
  "text": "第一条朋友圈",
  "mediaUrls": [
    "https://example.com/p1.jpg"
  ]
}
```

接口作用：创建一条新的朋友圈内容。

期望返回：

1. code=200。
2. data 非空（通常包含 momentId 或创建结果）。

### 9.2 点赞

1. Method: POST
2. URL: {{baseUrl}}/api/v1/moment/like/{{testMomentId}}
3. Body：根据 CreateLikeRequest 结构填写（至少包含当前用户标识）。

接口作用：对指定朋友圈点赞。

期望返回：

1. code=200。
2. data 非空。

### 9.3 评论

1. Method: POST
2. URL: {{baseUrl}}/api/v1/moment/comment/{{testMomentId}}
3. Body：根据 MomentCommentDTO 结构填写（评论内容、评论人信息）。

接口作用：对指定朋友圈发表评论。

期望返回：

1. code=200。
2. data 非空。

## 10. 最终通过标准

本轮验收 PASS 条件：

1. 七个服务至少各有一个核心接口通过（HTTP 200 且业务 code=200）。
2. 认证服务登录接口返回有效 token。
3. 网关转发链路可用（至少 3 个不同服务接口经网关可调用）。
4. 没有持续性 500 报错。

## 11. 常见失败与定位

1. 全部接口都失败。

   - 先看 gateway 日志：docker logs gateway --tail 200。

2. 认证相关失败（登录/注册/验证码）。

   - 看 authenticationservice 日志。
   - 核对 mysql、redis、nacos 是否可达。

3. 消息相关失败。

   - 看 messagingservice、offlinedatastore、kafka 日志。

4. 实时推送失败。

   - 看 realtimecommunicationservice 日志。
   - 核对 netty 端口映射和客户端连接配置。
