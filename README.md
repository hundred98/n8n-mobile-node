# n8n-nodes-mobile

[中文文档](README-zh.md)

A custom n8n node for mobile app integration, providing API endpoints for NextFlow App workflow monitoring and management.

## Features

- **Workflow Management**: Get workflow lists and detailed information
- **Execution Monitoring**: Retrieve execution logs and status
- **Workflow Control**: Enable/disable workflows remotely
- **Mobile Integration**: Designed specifically for mobile app integration
- **Auto Parameter Detection**: Automatically extract parameters from webhook queries

## Installation

1. Install the package:
```bash
npm install n8n-nodes-mobile
```

2. Restart n8n to load the new node

## Usage

### Node Configuration

The node provides two main actions:

#### 1. Get Data
- **Workflows**: Retrieve list of workflows with status and metadata
- **Executions**: Get execution logs for specific workflows

#### 2. Set Workflow
- **Set Status**: Enable or disable workflows remotely

### Parameter Sources

- **Auto Mode**: Automatically extracts parameters from webhook queries

### Webhook Integration

Mobile apps can interact with n8n workflows through webhooks:

```bash
# Get workflow data
GET /workflows/data

# Set workflow status
POST /workflows/set
```

## API Reference

## Example Workflow

See [Use-reference-demo.json](Use-reference-demo.json) for a complete example workflow demonstrating mobile app integration.

## Credentials

Configure n8n API credentials:
- **API Key**: Your n8n instance API key

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

- **hundred98** - hundred98@163.com

## Repository

- GitHub: https://github.com/hundred98/n8n-mobile-node



### 📱 WeChat Support

For any questions or suggestions, feel free to follow my WeChat Official Account for technical support:


<div align="center">
  <img src="./assets/wechat-qr.jpg" alt="WeChat QR Code" width="200"/>
  <br>
  <em>Scan QR Code to Follow</em>
</div>


---

