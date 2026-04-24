# AuthenticationService 包级说明

## 1. 这个服务的作用是什么
`AuthenticationService` 是 InfiniteChat 的用户接入中心，负责“账号身份相关”的核心能力：
- 注册（邮箱 + 验证码）
- 账号密码登录
- 邮箱验证码登录
- 更新头像
- 获取上传地址（MinIO 预签名 URL）

它本质上解决两类需求：
- 身份确认：用户是谁，是否有权限做某操作。
- 入门基础能力：给其他服务提供一个可信用户体系（`user_id/token/基础资料`）。

## 2. 为什么要单独做成一个服务
从需求分析角度：
- 认证逻辑是所有业务的起点，天然是独立边界。
- 安全策略（token、验证码、来源校验）需要集中治理。
- 账号体系会被聊天、朋友圈、联系人等多模块复用，拆服务更利于演进和扩展。

## 3. 这个包（根包）为什么存在
`com.shanyangcode.infinitechat.authenticationservice` 是服务主命名空间，用于聚合全部“认证域”代码，避免和其他服务代码混杂。

## 4. 根包中类的作用
### `AuthenticationServiceApplication`
- 作用：Spring Boot 启动入口，装配 IOC 容器并拉起 Web 服务。
- 为什么要有它：任何 Spring Boot 服务都需要一个“装配起点”，否则框架不会扫描 Bean、也不会启动 Tomcat。

## 5. 这个服务的典型开发思路（模拟真实开发过程）
1. 先确定认证域边界：只做“身份和用户基础资料”，不做消息与社交关系。
2. 先定义 API 合同（`data` 包中的 Request/Response）。
3. 再写 Controller 暴露接口，保持薄控制器。
4. 将业务落到 Service 层（校验验证码、生成 token、读写用户数据）。
5. 持久化通过 Mapper + Model 完成。
6. 安全与基础设施通过 `conf` 包集中配置（拦截器、MyBatis、MinIO、Redis）。
7. 使用 `exception + common.Result` 做统一错误返回，保证前端可稳定处理。

## 6. 包划分背后的核心原则
- 横向分层：`controller -> service -> mapper -> model`
- 纵向约束：DTO 与领域模型分离（`data` 与 `model`）
- 横切集中：配置与拦截放 `conf`，错误体系放 `exception`
- 常量收敛：`constants` 统一管理“可复用且稳定”的值

