# NextFlow App 集成节点

[English Documentation](README.md)

此包提供了用于N8N的集成节点，用于工作流管理和执行监控。

## 功能特性

### MobileApp 节点

- **获取数据**：统一端点用于检索工作流或执行数据
  - 数据类型：workflows/executions
  - 对于工作流：
    - 可选择包含或排除已禁用的工作流
    - 提供工作流详情，包括激活状态、创建时间
    - **手动触发节点检测**：自动检测工作流是否包含手动触发相关节点
      - 检测的节点类型：
        - `n8n-nodes-base.manualTrigger` - Manual Trigger节点
        - `n8n-nodes-base.webhook` - Webhook相关节点（包括所有Webhook变体）
        - `n8n-nodes-base.formTrigger` - 表单触发节点
        - `n8n-nodes-base.chatTrigger` - 聊天触发节点
        - `n8n-nodes-base.executeWorkflowTrigger` - 执行工作流触发节点（特殊处理：返回节点信息但禁用启动/停止）
        - `n8n-nodes-base.schedule` - 计划任务触发节点
        - `n8n-nodes-base.scheduleTrigger` - 计划任务触发节点
        - `n8n-nodes-base.cron` - Cron表达式触发节点
        - `n8n-nodes-base.interval` - 间隔触发节点
        - `n8n-nodes-base.timer` - 定时器触发节点
        - `@n8n/n8n-nodes-langchain.chatTrigger` - Langchain聊天触发节点
      - **返回true的条件**：当工作流中包含上述任意一种节点类型时，`includeManualNodes`字段返回`true`
      - **返回false的条件**：当工作流中不包含上述任何节点类型时，`includeManualNodes`字段返回`false`
      - **手动触发节点详细信息**：当`includeManualNodes`为true时，返回所有手动触发节点的详细信息，包括：
        - 节点ID
        - 节点名称
        - 节点类型
        - 参数配置
        - 位置信息
      - **用途**：便于移动端界面根据此字段对工作流进行分类展示，并显示手动触发节点供用户交互
  - 对于执行：
    - 按工作流ID过滤
    - 按状态过滤（all/success/error/waiting）
    - 限制结果数量
- **设置工作流状态**：启用或禁用指定的工作流
- **标准化的API响应**：为集成设计的标准化数据结构
- **错误处理**：当内部API访问不可用时提供错误信息

## 安装方法

### 方法1：使用N8N_CUSTOM_EXTENSIONS环境变量

1. 克隆或下载此仓库到本地目录
2. 构建项目：
   ```bash
   cd n8n-nodes-mobile
   npm install
   npm run build
   ```
3. 启动N8N时设置环境变量：
   ```bash
   N8N_CUSTOM_EXTENSIONS=/path/to/n8n-nodes-mobile n8n start
   ```

### 方法2：使用npm link

1. 克隆此仓库
2. 运行`npm install`安装依赖
3. 运行`npm run build`构建节点
4. 将节点链接到您的n8n安装：
   - 全局安装：`npm link`
   - 本地n8n：`cd path/to/n8n && npm link n8n-nodes-mobile`

### 方法3：从npm安装

1. 安装包：
```bash
npm install n8n-nodes-mobile
```

2. 重启n8n以加载新节点

## 使用指南

### 1. 配置API凭据

在使用节点前，需要配置n8n API凭据：

1. 在n8n界面中，转到"凭据"页面
2. 点击"创建新凭据"
3. 选择"n8n API"类型
4. 输入API Key和n8n实例的Base URL（可选，默认为http://localhost:5678）
   - 注意：Base URL只需要填写n8n实例的根地址，例如：http://localhost:5678
   - 不要包含/api/v1部分，系统会自动添加
5. 在MobileApp节点中选择这个凭据

### 2. 创建Webhook工作流

要实现移动API，您需要创建webhook工作流。以下是推荐的工作流设置：

#### GET /data 端点

用于检索工作流或执行数据：

- **Webhook 节点**：
  - 方法：GET
  - 路径：data
  - 查询参数：
    - `type`（必填，字符串）："workflows" 或 "executions"
    - 对于工作流：
      - `includeDisabled`（可选，布尔值）：是否包含禁用的工作流
      - `workflowId`（可选，字符串）：如果提供此参数，则只返回该特定工作流的完整节点数据
    - 对于执行：
      - `workflowId`（必填，字符串）：要获取执行记录的工作流ID

## 示例工作流

查看 [Use-reference-demo.json](Use-reference-demo.json) 获取完整的移动应用集成示例工作流。

### 3. API调用示例

#### 获取数据示例

**获取所有工作流**：
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=workflows&includeDisabled=true')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('工作流列表:', data.data);
      console.log('总数:', data.total);
    } else {
      console.error('获取失败:', data.error);
    }
  });
```

**获取特定工作流的完整节点数据**：
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=workflows&workflowId=wErEn9VajPinRQYB')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('工作流详情:', data.data[0]);
      console.log('节点数据:', data.data[0].nodes);
      console.log('连接关系:', data.data[0].connections);
    } else {
      console.error('获取失败:', data.error);
    }
  });
```

**获取执行记录**：
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=executions&workflowId=wErEn9VajPinRQYB&status=success&limit=10')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('执行记录:', data.data);
      console.log('总数:', data.total);
    } else {
      console.error('获取失败:', data.error);
    }
  });
```

#### 设置工作流状态

```javascript
// POST请求示例
fetch('https://your-n8n-instance.webhook.site/workflows/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    operationType: 'setStatus',
    workflowId: 'wErEn9VajPinRQYB',  // 工作流ID
    status: false  // 禁用工作流
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('操作成功:', data.message);
    console.log('更新后的工作流:', data.workflow);
  } else {
    console.error('操作失败:', data.error);
  }
});
```

## 开发

### 构建
```bash
npm run build
```

### 开发模式
```bash
npm run dev
```

### 代码检查
```bash
npm run lint
```

## 故障排除

### 节点未在N8N中显示

1. 检查构建是否成功：`npm run build`
2. 验证环境变量设置：确保`N8N_CUSTOM_EXTENSIONS`路径正确
3. 检查N8N启动日志，确认自定义扩展已成功加载
4. 验证package.json中的nodeTypes配置是否正确指向已编译的文件

## 安全注意事项

1. 在生产环境中，为webhook端点添加身份验证
2. 使用HTTPS确保安全的数据传输
3. 对于高安全性要求，实现IP白名单或API密钥验证
4. 监控API使用情况以防止滥用

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 作者

- **hundred98** - hundred98@163.com

## 仓库

- GitHub: https://github.com/hundred98/n8n-mobile-node



### 📱 微信支持

如果您有任何问题或建议，欢迎关注我的微信公众号获取技术支持：

<div align="center">
  <img src="./assets/wechat-qr.jpg" alt="WeChat QR Code" width="200"/>
  <br>
  <em>扫码关注微信公众号</em>
</div>
