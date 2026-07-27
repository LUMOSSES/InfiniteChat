# data.common.uploadUrl 包说明

## 包职责
定义“获取上传地址”能力的请求和响应 DTO，用于头像等文件上传前的 URL 协商。

## 为什么要创建这个包
从需求分析看，移动端/前端上传文件通常不希望业务服务转发二进制流，而是先向后端申请一个可直传对象存储的 URL。  
这个流程与登录注册逻辑不同，属于“通用基础能力”，因此独立到 `data.common.uploadUrl`。

## 类说明
### `UploadUrlRequest`
- 作用：接收前端传入的文件名 `fileName`。
- 业务意义：后端需要知道“对象名”才能生成对应的 MinIO 预签名 URL。

### `UploadUrlResponse`
- 作用：返回 `uploadUrl` 与 `downloadUrl`。
- 业务意义：
  - `uploadUrl` 用于客户端直接 PUT 上传。
  - `downloadUrl` 用于上传成功后回填用户头像地址。

## 模拟开发思路
1. 先定义上传流程：客户端不能直接拿存储密钥，必须服务端签名。
2. 所以先建 `UploadUrlRequest/Response` 定义接口契约。
3. Controller 收到请求后调 `CommonService.uploadUrl`。
4. Service 调用 `OSSUtils` 生成上传/下载地址后返回给前端。

