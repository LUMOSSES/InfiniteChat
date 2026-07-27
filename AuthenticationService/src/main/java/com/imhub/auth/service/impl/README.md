# service.impl 包说明

## 包职责
放置 `service` 接口的具体业务实现，完成真正的业务编排。

## 为什么创建这个包
需求实现通常会涉及多依赖协作（数据库、Redis、工具类），必须在实现层集中组织，避免控制器过重。

## 类说明
### `UserServiceImpl`
- 负责：
  - 注册：校验是否已注册 + 校验验证码 + 密码 MD5 + 生成用户 ID + 入库
  - 密码登录：校验账号密码 + 生成 JWT
  - 验证码登录：校验 Redis 验证码 + 查询用户 + 生成 JWT
  - 更新头像：根据 token 用户 ID 更新 `avatar`
- 核心依赖：`UserMapper`（通过 `ServiceImpl`）、`StringRedisTemplate`、`JwtUtil`
- 设计思考：把“用户身份行为”统一聚合在一个实现里，保证策略一致性。

### `CommonServiceImpl`
- 负责：
  - 发送邮箱验证码：生成随机码 -> Redis 存储（过期）-> 邮件发送
  - 生成上传 URL：调用 MinIO 工具生成上传与下载地址
- 核心依赖：`StringRedisTemplate`、`EmailUtil`、`OSSUtils`
- 设计思考：将横向通用能力从用户主流程拆开，降低 `UserServiceImpl` 复杂度。

## 开发时思考过程
1. 先按接口分配实现类职责。
2. 在实现类中组织“校验 -> 状态变更 -> 外部副作用 -> 响应组装”的固定流程。
3. 错误场景统一抛语义化异常，由全局异常处理器接管。

