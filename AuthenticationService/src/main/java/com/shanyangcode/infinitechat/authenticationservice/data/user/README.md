# data.user 包说明

## 包职责
承载“用户身份相关”的所有 API DTO（注册、登录、验证码登录、头像更新）。

## 为什么要创建这个包
从需求上，用户域是认证服务最核心路径，且各接口字段差异很大：  
- 注册要 `email/password/code`  
- 密码登录要 `email/password`  
- 验证码登录要 `email/code`  
- 更新头像要 `avatarUrl`  

如果用一个通用 DTO 会造成字段冗余和校验混乱，因此拆成按场景分组的子包。

## 子包与职责
- `login`：账号密码登录 DTO
- `loginCode`：验证码登录 DTO
- `register`：注册 DTO
- `updateAvatar`：头像更新 DTO

## 模拟开发思路
1. 先把用户域 API 用例列清楚。
2. 每个用例单独建 Request/Response，避免“万能对象”。
3. 在 DTO 层做参数校验，把无效请求挡在 Controller 入口。

