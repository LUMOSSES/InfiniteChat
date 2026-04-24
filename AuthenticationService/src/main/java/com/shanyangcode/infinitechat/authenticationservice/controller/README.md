# controller 包说明

## 包职责
对外提供 HTTP API，完成参数接收、调用服务层、组装统一响应。

## 为什么创建这个包
需求上需要一组对外接口，但 Controller 应该“薄”，只做协议层工作，不直接写业务规则。

## 类说明
### `UserController`
- 对应接口：
  - `POST /api/v1/user/register`
  - `POST /api/v1/user/login`
  - `POST /api/v1/user/loginCode`
  - `PATCH /api/v1/user/avatar`
- 作用：用户身份相关 API 入口。
- 思考：将“用户身份行为”统一收口到一个控制器，便于权限和审计。

### `CommonController`
- 对应接口：
  - `GET /api/v1/user/common/email`（含 `/sms` 路径复用）
  - `GET /api/v1/user/common/uploadUrl`
- 作用：提供账号体系的通用能力（验证码、上传地址）。
- 思考：把“用户相关但不直接是登录动作”的能力拆到 Common，控制器边界更清晰。

## 开发时思考过程
1. 从前端页面动作反推 API 列表。
2. 先定义请求/响应 DTO。
3. Controller 只做参数校验、调用 service、返回 `Result`。
4. 复杂校验和状态变更全部下沉到 service。

