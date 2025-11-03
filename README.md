# NextFlow App Integration Node

This package provides an integration node for N8N to enable workflow monitoring and management via API endpoints.

[中文文档](README-zh.md)

## Features

### MobileApp Node

- **Get Data**: Unified endpoint for retrieving workflow or execution data
  - Data types: workflows/executions
  - For workflows:
    - Option to include or exclude disabled workflows
    - Provides workflow details including activation status and creation time
    - **Manual trigger node detection**: Automatically detects if a workflow contains manual trigger nodes
      - Detected node types:
        - `n8n-nodes-base.manualTrigger` - Manual Trigger node
        - `n8n-nodes-base.webhook` - Webhook related nodes (including all Webhook variants)
        - `n8n-nodes-base.formTrigger` - Form trigger nodes
        - `n8n-nodes-base.chatTrigger` - Chat trigger nodes
        - `n8n-nodes-base.executeWorkflowTrigger` - Execute Workflow Trigger node (special handling: returns node info but disables start/stop)
        - `n8n-nodes-base.schedule` - Schedule trigger node
        - `n8n-nodes-base.scheduleTrigger` - Schedule trigger node
        - `n8n-nodes-base.cron` - Cron trigger node
        - `n8n-nodes-base.interval` - Interval trigger node
        - `n8n-nodes-base.timer` - Timer trigger node
        - `@n8n/n8n-nodes-langchain.chatTrigger` - Langchain chat trigger nodes
      - **Returns true when**: The workflow contains any of the above node types, the `includeManualNodes` field returns `true`
      - **Returns false when**: The workflow does not contain any of the above node types, the `includeManualNodes` field returns `false`
      - **Manual trigger node details**: When `includeManualNodes` is true, returns detailed information about all manual trigger nodes, including:
        - Node ID
        - Node name
        - Node type
        - Parameter configuration
        - Position information
      - **Purpose**: Allows the mobile interface to categorize workflows for display based on this field and show manual trigger nodes for user interaction
  - For executions:
    - Filter by workflow ID
    - Filter by status (all/success/error/waiting)
    - Limit result count
- **Set Workflow Status**: Enable or disable specified workflows
- **Standardized API responses**: Standardized data structures designed for integration
- **Error handling**: Provides error information when internal API access is unavailable

## Installation

### Method 1: Using N8N_CUSTOM_EXTENSIONS environment variable

1. Clone or download this repository to a local directory
2. Build the project:
   ```bash
   cd n8n-nodes-mobile
   npm install
   npm run build
   ```
3. Set the environment variable when starting N8N:
   ```bash
   N8N_CUSTOM_EXTENSIONS=/path/to/n8n-nodes-mobile n8n start
   ```

### Method 2: Using npm link

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the node
4. Link the node to your n8n installation:
   - Global installation: `npm link`
   - Local n8n: `cd path/to/n8n && npm link n8n-nodes-mobile`

### Method 3: Install from npm

1. Install the package:
```bash
npm install n8n-nodes-mobile
```

2. Restart n8n to load the new node

## Usage Guide

### 1. Configure API Credentials

Before using the node, you need to configure n8n API credentials:

1. In the n8n interface, go to the "Credentials" page
2. Click "Create New Credential"
3. Select "n8n API" type
4. Enter the API Key and Base URL for your n8n instance (optional, defaults to http://localhost:5678)
   - Note: The Base URL should only contain the root address of your n8n instance, for example: http://localhost:5678
   - Do not include the /api/v1 part, the system will add it automatically
5. Select this credential in the MobileApp node

### 2. Create Webhook Workflows

To implement the mobile API, you need to create webhook workflows. Here are the recommended workflow setups:

#### GET /data Endpoint

Used for retrieving workflow or execution data:

- **Webhook Node**:
  - Method: GET
  - Path: data
  - Query Parameters:
    - `type` (required, string): "workflows" or "executions"
    - For workflows:
      - `includeDisabled` (optional, boolean): Whether to include disabled workflows
      - `workflowId` (optional, string): If provided, only return complete node data for this specific workflow
    - For executions:
      - `workflowId` (required, string): The workflow ID to get execution records for

## Example Workflow

See [Use-reference-demo.json](Use-reference-demo.json) for a complete example workflow demonstrating mobile app integration.

### 3. API Call Examples

#### Get Data Examples

**Get all workflows**:
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=workflows&includeDisabled=true')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Workflow list:', data.data);
      console.log('Total:', data.total);
    } else {
      console.error('Failed to get data:', data.error);
    }
  });
```

**Get complete node data for a specific workflow**:
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=workflows&workflowId=wErEn9VajPinRQYB')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Workflow details:', data.data[0]);
      console.log('Node data:', data.data[0].nodes);
      console.log('Connections:', data.data[0].connections);
    } else {
      console.error('Failed to get data:', data.error);
    }
  });
```

**Get execution records**:
```javascript
fetch('https://your-n8n-instance.webhook.site/data?type=executions&workflowId=wErEn9VajPinRQYB&status=success&limit=10')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Execution records:', data.data);
      console.log('Total:', data.total);
    } else {
      console.error('Failed to get data:', data.error);
    }
  });
```

#### Set Workflow Status

```javascript
// POST request example
fetch('https://your-n8n-instance.webhook.site/workflows/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    operationType: 'setStatus',
    workflowId: 'wErEn9VajPinRQYB',  // Workflow ID
    status: false  // Disable workflow
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Operation successful:', data.message);
    console.log('Updated workflow:', data.workflow);
  } else {
    console.error('Operation failed:', data.error);
  }
});
```

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

## Troubleshooting

### Node not appearing in N8N

1. Check if build was successful: `npm run build`
2. Verify environment variable setup: Ensure `N8N_CUSTOM_EXTENSIONS` path is correct
3. Check N8N startup logs to confirm custom extensions loaded successfully
4. Verify that nodeTypes configuration in package.json correctly points to compiled files

## Security Considerations

1. In production environments, add authentication to webhook endpoints
2. Use HTTPS to ensure secure data transmission
3. For high security requirements, implement IP whitelisting or API key verification
4. Monitor API usage to prevent abuse

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

