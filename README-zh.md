# n8n-nodes-mobile

[English Documentation](README.md)

用于移动应用集成的自定义 n8n 节点，为 NextFlow App 提供工作流监控和管理的 API 端点。

## 功能特性

- **工作流管理**: 获取工作流列表和详细信息
- **执行监控**: 检索执行日志和状态
- **工作流控制**: 远程启用/禁用工作流
- **移动集成**: 专为移动应用集成设计
- **自动参数检测**: 自动从 webhook 查询中提取参数

## 安装

1. 安装包：
```bash
npm install n8n-nodes-mobile
```

2. 重启 n8n 以加载新节点

## 使用方法

### 节点配置

节点提供两个主要操作：

#### 1. 获取数据
- **工作流**: 检索工作流列表及其状态和元数据
- **执行记录**: 获取特定工作流的执行日志

#### 2. 设置工作流
- **设置状态**: 远程启用或禁用工作流

### 参数来源

- **自动模式**: 自动从 webhook 查询中提取参数

### Webhook 集成

移动应用可以通过 webhook 与 n8n 工作流交互：

```bash
# 获取工作流数据
GET /workflows/data

# 设置工作流状态
POST /workflows/set
```

## API 参考

## 示例工作流

查看 [Use-reference-demo.json](Use-reference-demo.json) 获取完整的移动应用集成示例工作流。

## 凭据配置

配置 n8n API 凭据：
- **API 密钥**: 您的 n8n 实例 API 密钥

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
