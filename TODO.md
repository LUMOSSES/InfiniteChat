# Threadora 待办事项

## 高优先级

### 1. AI Agent 接入
- **项目**：`D:\Desktop\IM-Agent`（GitHub: `LUMOSSES/IM-Agent`），Spring Boot 3.x + Spring AI Alibaba 1.0.0-M5（DashScope 通义千问）+ RAG + MCP
- **端口**：8087，Gateway 路由 `/api/v1/ai/**` → `http://127.0.0.1:8087` 已配置
- **状态**：已接入，`start-services.ps1` 已包含，`kill-services.ps1` 已包含

### 2. 红包模块 - 前端 UI
- **现状**：后端已完整实现（发红包、抢红包、余额扣减、Lua 原子操作、过期退款、Kafka 消息）
- **缺失**：`Chat.tsx` 中没有红包消息气泡渲染、没有发红包入口、没有抢红包弹窗。前端 API 调用已在 `api/message.ts` 中定义（`sendRedPacket`、`receiveRedPacket`、`getRedPacketDetail`）
- **数据库**：`red_packet`、`red_packet_receive`、`user_balance`、`balance_log` 四张表已建好

### 3. 群聊功能 - 前端 UI
- **现状**：后端 `ContactController` 有完整群管理接口（创建群、邀请、踢人、退出、成员列表）
- **缺失**：`Contacts.tsx` 只有好友/好友申请两个 Tab，没有群列表、创建群按钮、成员管理等 UI
- **API 已定义**：`api/contact.ts` 中已包装了群相关接口

## 中优先级

### 4. 好友操作 API 路径修复
- `deleteFriend`：前端发 `DELETE /v1/contact/friend`，后端期望 `DELETE /v1/contact/{userUuid}/friend/{receiveUserUuid}`
- `blockFriend`：前端发 `POST /v1/contact/friend/block`，后端期望 `POST /v1/contact/{userUuid}/block/{receiveUserUuid}`
- `getFriendDetail`：前端发 `GET /v1/contact/friend/detail?friendId=...`，后端期望 `GET /v1/contact/{userUuid}/friend/{friendUuid}`

### 5. 消息模板生成器 (Generator)
- **现状**：前端 `Generator.tsx` 用 `setTimeout` 模拟后端调用，返回写死的内容，没有真正调用 API
- **缺失**：没有后端服务，没有真实的模板生成逻辑

## 低优先级

### 6. 用户钱包/余额页面
- **现状**：后端余额系统完整（发红包扣款、抢红包入账、退款、流水记录），`user_balance` 和 `balance_log` 表已建好
- **缺失**：前端无任何钱包余额展示页面

### 7. 图片消息支持
- **现状**：后端 `PictureMessage` / `PictureMessageBody` 模型已定义，`MessageRcvTypeEnum.PICTURE_MESSAGE(2)` 已存在
- **缺失**：前端 Chat 只发送文本消息（type=1），没有图片选择/上传/发送功能

### 8. 消息历史记录 & 离线消息
- **现象 1**：聊天页面看不到离线消息（离线消息拉取可能返回空或格式不匹配）
- **现象 2**：刷新页面后消息记录全部消失——消息只存在 React `useState` 中，无持久化
- **根因**：`Chat.tsx` 只在挂载时调用一次 `offlineApi.getOfflineMessages(time=Date(0))`，拉取后这些消息被标记已读/消费，再次刷新就不会再返回。切换会话也不会重新加载该会话的历史消息
- **需要**：1) 后端提供分页拉取会话历史消息的 API；2) 前端切换会话时调用该 API 加载历史；3) 调试离线消息拉取为何返回空
