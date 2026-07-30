# Threadora 项目面试介绍

---

## 一、项目概览

Threadora 是一个**即时通讯（IM）社交平台**，后端采用 **Spring Cloud 微服务架构**，共计 **7 个微服务**，覆盖用户认证、好友关系、即时消息、朋友圈、红包、离线消息等完整功能。项目从零搭建，包含基础设施选型、服务拆分、通信方案设计、数据库建模、安全防护等全流程。

- **代码规模**：7 个 Maven 模块，13 张数据库表，6 套 Docker 基础设施
- **核心指标**：支持 WebSocket 长连接实时通信、Kafka 异步消息、Redis Lua 原子操作
- **部署方式**：Docker Compose 一键启动基础设施，PowerShell 脚本批量启动服务

---

## 二、需求来源与业务场景

### 2.1 为什么做 IM？

IM 是互联网中最经典的高并发场景之一，技术挑战集中：

- **实时性**：消息需要毫秒级送达，不能依赖轮询
- **可靠性**：消息不能丢、不能重，用户不在线时需离线存储
- **一致性**：红包抢领场景，金额不能超发、不能少发
- **扩展性**：用户规模增长时，系统需能水平扩展

这些挑战涵盖了后端工程师日常面临的核心问题：并发控制、异步解耦、分布式一致性、长连接管理等。

### 2.2 功能全景

| 模块 | 功能 |
|------|------|
| 用户系统 | 邮箱注册、密码登录、验证码登录、头像上传 |
| 好友系统 | 搜索用户、发送/接受/拒绝好友申请、黑名单、好友列表 |
| 即时通讯 | 单聊/群聊消息、WebSocket 实时推送 |
| 朋友圈 | 图文发布、点赞、评论、好友动态推送 |
| 红包系统 | 普通红包/拼手气红包、余额管理、过期退款 |
| 离线消息 | Kafka 异步持久化，用户上线后拉取 |

---

## 三、技术选型与理由

### 3.1 整体选型

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| Spring Boot | 2.6.13 | 生态成熟，社区活跃，微服务支持好 |
| Spring Cloud Alibaba | 2021.0.5.0 | 国产微服务套件，Nacos 比 Eureka 功能更强（配置中心+注册中心一体） |
| Spring Cloud Gateway | 3.1.3 | 基于 WebFlux 的响应式网关，性能优于 Zuul |
| Nacos | 2.3.0 | 服务发现 + 配置中心，2.x 使用 gRPC 长连接，实时性更好 |
| Netty | 4.x | 业界最成熟的高性能 NIO 框架，适合 WebSocket 长连接场景 |
| Kafka | 最新 | 高吞吐消息队列，适合消息持久化和异步解耦 |
| MyBatis-Plus | 3.5.x | 单表 CRUD 零代码，分页插件、逻辑删除开箱即用 |
| Redis | 7 | 验证码缓存、session 管理、红包计数（Lua 原子操作） |
| MinIO | 最新 | S3 兼容的对象存储，适合头像/图片等小文件 |
| MySQL | 8.0 | 关系型数据库，用户/好友/消息等核心数据存储 |
| JWT (jjwt) | 0.11.5 | 无状态认证，HS512 签名，适合分布式环境 |

### 3.2 关键技术决策

**为什么用 Nacos 而不是 Eureka？**
- Nacos 同时提供服务发现和配置管理，减少组件数量
- 2.x 版本使用 gRPC 长连接推送服务变更，比 Eureka 的心跳轮询更实时
- 阿里开源，国内社区支持好

**为什么用 Netty 自建 WebSocket 而不是 Spring WebSocket？**
- Netty 的 NIO 模型性能更高，内存占用更低
- 对连接生命周期（握手、心跳、空闲断开）的控制更精细
- 可以自定义 Pipeline 做 JWT 鉴权，不需要走 Spring Security 那一套

**为什么用 Kafka 而不是 RabbitMQ？**
- IM 场景消息量大，Kafka 的吞吐量远高于 RabbitMQ
- 消息需要持久化且支持重复消费（离线消息场景）
- Topic 分区机制天然支持消息有序性

**为什么用 MinIO 而不是直接存本地 / OSS？**
- S3 兼容 API，开发环境和生产环境可以无缝切换（本地 MinIO / 线上阿里云 OSS）
- 预签名 URL 上传，减轻服务端带宽压力

---

## 四、架构设计

### 4.1 服务拓扑

```
                  ┌─────────────────────────┐
  浏览器 / App ──▶│   GateWay (10010)       │
                  │   Spring Cloud Gateway  │
                  └───────┬─────────────────┘
                          │ Nacos 服务发现
          ┌───────┬───────┼───────┬───────┬───────┬────────┐
          ▼       ▼       ▼       ▼       ▼       ▼        ▼
   AuthService  Contact  Message  RTC    Moment  Offline   Netty
   (8082)       (8084)   (8081)  (8083)  (8086)  (8085)   (9100)
     │           │         │       │        │       │        ▲
     │           │         │       │        │       │        │
     ▼           ▼         ▼       ▼        ▼       ▼        │
   MySQL      MySQL     MySQL   Redis    MySQL   Kafka ──────┘
   Redis      Redis     Kafka           MinIO
   MinIO                    Redis
```

### 4.2 服务职责

| 服务 | 端口 | 核心职责 | 关键技术点 |
|------|------|----------|-----------|
| **GateWay** | 10010 | 统一入口、路由转发、CORS、防直接访问 | Gateway + Nacos LB |
| **AuthenticationService** | 8082 | 注册、登录、JWT 签发、验证码、头像上传 | JWT HS512、MinIO 预签名、SourceHandler |
| **RealTimeCommunicationService** | 8083 + 9100 | HTTP 消息接收 + Netty WebSocket 长连接推送 | Netty Pipeline、Channel 管理、心跳保活 |
| **MessageingService** | 8081 | 消息发送、红包系统 | Kafka 生产、Redis Lua、Snowflake ID、Feign |
| **ContanctService** | 8084 | 好友管理、群组、好友申请 | OkHttp 跨服务推送、Redis 申请过期 |
| **OfflineDataStoreService** | 8085 | 离线消息持久化、查询 | Kafka 消费、多表联查 |
| **MomentService** | 8086 | 朋友圈发布、点赞、评论、动态推送 | Nacos 实例发现、多实例广播推送 |

### 4.3 通信方案

```
同步调用（HTTP REST）：
  GateWay ──▶ 各服务（通过 Nacos 服务发现 + LoadBalancer 负载均衡）
  MessageingService ──▶ ContanctService（Feign 声明式调用）

异步推送（跨服务）：
  MessageingService ──OkHttp──▶ RealTimeCommunicationService ──WebSocket──▶ 客户端
  MomentService ──OkHttp──▶ RealTimeCommunicationService ──WebSocket──▶ 客户端
  ContanctService ──OkHttp──▶ RealTimeCommunicationService ──WebSocket──▶ 客户端

异步持久化：
  MessageingService ──Kafka Produce──▶ Kafka ──Kafka Consume──▶ OfflineDataStoreService ──▶ MySQL
```

### 4.4 数据库设计要点

13 张表，核心设计原则：

- **user 表**：email/phone 唯一索引，软删除（status 字段）
- **session 表**：抽象单聊和群聊为统一"会话"概念，type 字段区分
- **user_session 表**：用户-会话多对多关系，role 字段控制群权限
- **red_packet 表**：remaining_amount / remaining_count 双字段追踪剩余，配合 Redis 原子扣减
- **moment 表**：逻辑删除（delete_time），点赞/评论单独表，唯一索引防重复

---

## 五、实现中遇到的困难与解决方案

### 5.1 JWT 依赖地狱（NoClassDefFoundError: DatatypeConverter）

**问题**：项目原使用 jjwt 0.9.1，依赖 JDK 自带的 `javax.xml.bind.DatatypeConverter`。切换到 JDK 17 后，JAXB 模块被移除，登录直接报 `NoClassDefFoundError`。

**尝试过程**：
- 尝试 1：添加 `javax.xml.bind:jaxb-api` → 失败（JDK 17 连实现类都没了）
- 尝试 2：添加 `org.glassfish.jaxb:jaxb-runtime` → 失败（JAR 文件被运行中的 Java 进程锁住，Maven clean 无法删除旧包）

**最终方案**：将 jjwt 从 0.9.1 升级到 **0.11.5**，同时引入 `jjwt-api + jjwt-impl + jjwt-jackson` 三个包。新版 jjwt 用 Jackson 做 JSON 处理而非 JAXB，彻底摆脱了 Java EE 依赖。API 也从 `Jwts.parser()` 迁移到 `Jwts.parserBuilder()`。

**教训**：技术债要及早还。依赖老旧的 Java EE 标准在 JDK 8 → 17 的迁移中会成为隐性炸弹。

---

### 5.2 JWT 密钥强度攻击（WeakKeyException）

**问题**：升级 jjwt 后，登录报 `WeakKeyException: The specified SecretKey is not strong enough to be used with HS512`。

**根因**：原密钥 `"goat"` 只有 4 字节（32 bits）。jjwt 0.11.x 强制要求密钥长度 ≥ 算法最低标准：HS512 要求 512 bits = **64 字节**。

**解决**：将密钥改为 64 字符长字符串，使用 `SecretKeySpec` 包装后传给 `signWith()`。

**教训**：安全库的约束收紧是合理的——4 字节密钥可以在秒级被暴力破解。要理解加密算法的底层要求，不能盲目复制粘贴。

---

### 5.3 Nacos 2.x gRPC 端口未映射导致服务注册失败

**问题**：服务启动后无法注册到 Nacos，一直重试。

**根因**：Nacos 2.x 在 1.x 的 HTTP 协议之上新增了 gRPC 通道（端口偏移 +1000）。Docker Compose 只映射了 `8848:8848`，没有映射 `9848:9848`。

**解决**：在 docker-compose 中增加 `9848:9848` 端口映射，同时在 Nacos 配置中启用 `failure-tolerance-enabled: true` + `fail-fast: false` 提高容错。

**教训**：使用新技术版本前要读 Release Notes。Nacos 2.x 的 gRPC 协议是架构级变化，不是简单的版本升级。

---

### 5.4 Gateway CORS 跨域导致前端无法登录

**问题**：前端 Vite 开发服务器 (`localhost:5173`) 调用 Gateway (`localhost:10010`) 登录接口时浏览器拦截。

**根因**：Gateway 的 CORS 配置只允许了 `localhost:10010`，没有加入前端开发服务器的地址。

**解决**：在 Gateway 的 application.yaml 中添加 `http://localhost:5173` 到 `allowedOrigins`。

**教训**：微服务架构下 CORS 策略要在一开始就考虑进去，尤其是前后端分离、不同端口开发时。

---

### 5.5 SourceHandler 安全拦截器

**问题**：AuthenticationService 内部所有接口都有 SourceHandler 校验 `X-Request-Source: Threadora-GateWay` 请求头。如果直接调用 AuthenticationService（跳关 Gateway），会返回 400 错误码 40301 "非法请求来源"。

**设计原因**：这是一种**简单有效的纵深防御**——确保所有外部请求必须通过 Gateway 这一层进入，防止内部服务直接被外部访问。Gateway 在路由配置中为该服务自动添加此请求头。

**教训**：微服务不仅要拆分，还要考虑每层的安全边界。不依赖 IP 白名单这种容易被绕过的机制，而是在应用层做 Header 校验。

---

### 5.6 WebSocket JWT 鉴权与连接管理

**问题**：WebSocket 建立连接时的鉴权不能像 HTTP 一样在 Header 中带 Authorization（浏览器 WebSocket API 不支持自定义 Header）。

**方案**：
- 将 `token` 和 `userId` 通过 URL query 参数传递
- 自定义 `WebSocketTokenAuthHeader` 处理器，在 Netty Pipeline 中拦截 HTTP Upgrade 请求，提取参数并存储到 Channel Attribute
- 握手完成后在 `MessageInboundHandler.userEventTriggered()` 中验证 JWT

**连接管理**：
- 使用 `ConcurrentHashMap` 实现双向映射（userId ↔ Channel + Channel ↔ userId）
- 用户登录时将自身的 Netty 服务器 IP 写入 Redis (`user:session:{userId}`)
- 其他服务推送消息时，从 Redis 查到目标用户所在的 Netty 实例 IP，通过 OkHttp 直接调用该实例的 HTTP 接口
- 心跳保活：5 分钟 IdleStateHandler，无读事件则主动断开连接

---

### 5.7 红包系统的并发安全

**问题**：拼手气红包场景下，多个用户同时抢红包，可能出现超发（超过 total_count）或金额计算错误。

**方案**：
- 使用 **Redis Lua 脚本**保证 count 递减和金额计算的原子性
- Lua 脚本中先 `DECR remaining_count`，如果结果 >= 0 才允许抢，否则返回失败
- 通过 Redis 的 key 过期事件（`RedPacketExpireListener`）实现 24 小时过期自动退款

**为什么不用数据库行锁？**
- 抢红包是高并发瞬时操作，MySQL 行锁的竞争会成为瓶颈
- Redis 单线程模型 + Lua 脚本天然原子，性能远超数据库锁

---

### 5.8 离线消息的可靠投递

**问题**：用户不在线时消息如何处理？如何保证不丢消息？

**方案**：
- **发送路径**：MessageingService → Kafka → OfflineDataStoreService 消费并写入 MySQL
- **在线推送**：MessageingService 同时通过 OkHttp 调用 RealTimeCommunicationService 的 HTTP 接口推送
- **离线拉取**：用户上线后调用 OfflineDataStoreService 的 `/api/v1/offline/message` 拉取
- **Kafka 消费**：使用 `group_id` 保证消息只被消费一次，`auto-offset-reset: earliest` 保证不丢

**关键设计**：Kafka 只用于可靠持久化，不参与在线推送。即使 WebSocket 推送失败（用户离线），消息也已经写入 Kafka，会被 OfflineDataStoreService 持久化到 MySQL，用户上线即可拉取。

---

### 5.9 Maven 构建时 JAR 被锁定（Windows 特有）

**问题**：在 Windows 上运行 `mvn clean package` 时，如果对应服务的 JAR 正被 Java 进程运行，Maven 无法删除旧的 target 目录，导致构建失败。

**解决**：写 PowerShell 脚本 (`kill-services.ps1`)，先按端口杀死所有服务进程，再执行构建。

**教训**：Windows 的文件锁机制比 Linux 更严格，开发和 CI 流程要考虑平台差异。

---

### 5.10 跨服务实时推送的服务发现

**问题**：MessageingService、MomentService、ContanctService 都需要向 RealTimeCommunicationService 推送实时通知，但可能存在多个 Netty 实例（水平扩展后）。如何找到正确的实例？

**方案**：
- **用户上线时**：Netty 握手成功后，将 `用户的 Netty 服务器 IP` 写入 Redis key `user:session:{userId}`
- **推送时**：
  - 单聊消息：从 Redis 查到目标用户所在 Netty IP，OkHttp 直连推送
  - 群聊消息 / 朋友圈：通过 Nacos `DiscoveryClient` 获取所有 Netty 实例，线程池并发推送

**设计思想**：Redis 作为用户会话注册表（Session Registry），本质上是 Nacos 服务发现之上的细粒度路由层。

---

## 六、项目亮点总结（面试一句话版本）

1. **自主架构设计**：从零拆分为 7 个微服务，每个服务职责清晰、边界明确
2. **实时通信方案**：Netty WebSocket + Redis 会话注册 + OkHttp 跨服务推送，实现分布式长连接管理
3. **红包并发控制**：Redis Lua 脚本保证原子操作，Key 过期事件实现自动退款
4. **消息可靠性**：Kafka 异步持久化 + 在线推送双通道，离线消息不丢失
5. **安全防护**：Gateway 统一入口 + SourceHandler 防绕过 + JWT HS512 无状态认证
6. **工程化实践**：Docker Compose 管理 6 套基础设施，PowerShell 脚本一条命令启停所有服务

---

## 七、未来可优化方向（展示技术视野）

- **消息已读/未读**：利用 Redis HyperLogLog 或 Bitmap 统计消息阅读状态
- **水平扩展**：Netty 服务多实例时，通过 Redis Pub/Sub 广播用户上线/下线事件
- **消息可靠性升级**：引入 ACK + 重试机制，替代当前的 fire-and-forget 推送
- **监控告警**：接入 Prometheus + Grafana 监控各服务 QPS、Kafka 消费延迟、Netty 连接数
- **容器化部署**：为每个服务编写 Dockerfile，迁移到 Kubernetes 编排
- **CI/CD**：接入 GitHub Actions 或 Jenkins 实现自动化构建、测试、部署
