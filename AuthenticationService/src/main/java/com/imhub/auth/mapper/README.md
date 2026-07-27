# mapper 包说明

## 包职责
数据访问层（DAO），负责把 service 的数据操作请求转换为数据库操作。

## 为什么创建这个包
需求上 service 关心业务语义，不应关心 SQL 细节。  
通过 mapper 抽象：
- 降低业务与数据库耦合
- 便于替换 ORM 或调整 SQL

## 类说明
### `UserMapper`
- 继承 `BaseMapper<User>`，获得常见 CRUD 能力。
- 对应 XML：`resources/mapper/UserMapper.xml`（字段映射定义）。
- 设计思考：当前复杂 SQL 不多，先用 MyBatis-Plus 通用能力即可。

## 开发时思考过程
1. 先定义领域实体 `User`。
2. 用 `BaseMapper` 快速获得基本 CRUD。
3. 如果后续需要复杂查询，再在 `UserMapper` 增加自定义方法。

