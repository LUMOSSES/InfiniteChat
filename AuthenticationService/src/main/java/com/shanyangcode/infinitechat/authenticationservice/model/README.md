# model 包说明

## 包职责
定义数据库实体模型（当前为 `user` 表映射）。

## 为什么创建这个包
需求上数据库是持久化真相来源，需要一个与表结构对应的对象层，供 ORM 映射与 service 使用。

## 类说明
### `User`
- 映射表：`user`
- 关键字段：
  - `userId`：主键
  - `userName/password/email/phone`
  - `avatar/signature/gender/status`
  - `createdAt/updatedAt`
- 设计思考：
  - 用 `@TableName/@TableId` 明确映射关系
  - 与 `data` 包 DTO 分离，避免 API 协议和表结构绑定

## 开发时思考过程
1. 从数据库表设计反推实体字段。
2. 配置注解确保 ORM 正确映射。
3. 在 service 中按场景选择 DTO 与实体转换，不直接暴露实体给外部接口。

