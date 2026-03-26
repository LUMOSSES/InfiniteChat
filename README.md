# InfiniteChat

InfiniteChat 是一个基于 Spring Boot 的聊天系统后端工程，当前仓库以多模块 Maven 项目组织，已经包含认证服务和网关两个核心模块。

## 项目定位

这个项目目前主要负责用户接入层能力，包括：

- 用户注册
- 用户密码登录
- 邮箱验证码登录
- 用户头像更新
- 邮箱验证码发送
- 对象存储上传地址生成
- 网关统一路由转发

从现有代码看，项目采用微服务拆分思路，服务发现使用 Nacos，数据层使用 MySQL + MyBatis-Plus，缓存使用 Redis，文件存储使用 MinIO，认证令牌使用 JWT。

## 项目结构

```text
InfiniteChat
├─ pom.xml
├─ AuthenticationService
└─ GateWay
```

### `AuthenticationService`

认证服务，负责用户相关业务与通用接入能力。

当前已实现的接口主要包括：

- `POST /api/v1/user/register` 用户注册
- `POST /api/v1/user/login` 用户账号登录
- `POST /api/v1/user/loginCode` 验证码登录
- `PATCH /api/v1/user/avatar` 更新用户头像
- `GET /api/v1/user/common/email` 发送邮箱验证码
- `GET /api/v1/user/common/uploadUrl` 获取上传地址

技术点：

- Spring Boot 2.6.x
- Spring Web
- Bean Validation
- MyBatis-Plus
- MySQL
- Redis
- Spring Mail
- JWT
- MinIO
- Nacos Discovery

### `GateWay`

统一网关模块，基于 Spring Cloud Gateway。

当前配置中，网关会将 `/api/v1/user/**` 路径转发到 `AuthenticationService`，适合作为前端统一入口，并负责后续扩展更多服务路由。

技术点：

- Spring Cloud Gateway
- Spring Cloud LoadBalancer
- Nacos Discovery

## 运行依赖

按当前配置，项目运行依赖以下基础设施：

- MySQL
- Redis
- MinIO
- Nacos
- SMTP 邮件服务

建议将本地开发环境中的账号、密码、地址等配置迁移到环境变量或独立配置文件中，不要直接写入仓库。

## 构建与启动

### 1. 构建

在项目根目录执行：

```bash
mvn clean package
```

### 2. 启动认证服务

```bash
cd AuthenticationService
mvn spring-boot:run
```

### 3. 启动网关

```bash
cd GateWay
mvn spring-boot:run
```

## 当前状态说明

- 根目录 `pom.xml` 目前只声明了 `AuthenticationService` 模块
- `GateWay` 目录已经存在，但尚未加入根聚合模块列表
- 仓库内存在 `target` 构建产物，通常建议加入 `.gitignore` 并避免提交

## 后续可扩展方向

- 聊天消息服务
- 会话管理服务
- WebSocket 实时通信
- 好友与群组系统
- 文件消息与媒体资源管理
- 鉴权中间件与统一异常码规范

## 适用场景

该项目适合作为聊天系统后端脚手架或课程设计基础工程，尤其适合继续扩展为完整的即时通讯平台。
