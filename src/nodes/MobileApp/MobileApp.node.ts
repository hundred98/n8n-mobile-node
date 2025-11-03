import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class MobileApp implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Mobile App Integration',
    name: 'mobileApp',
    icon: 'file:mobile.svg',
    group: ['transform'],
    version: 1,
    description: 'Provides API endpoints for NextFlow App - workflow monitoring and management',
    defaults: {
      name: 'Mobile App Integration',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'n8nApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          {
            name: 'Get Data',
            value: 'getData',
            description: 'Get workflow or execution data',
          },
          {
            name: 'Set Workflow',
            value: 'setWorkflow',
            description: 'Set workflow status',
          },
        ],
        default: 'getData',
        description: 'Select the operation to perform',
      },
      {
        displayName: 'Parameter Source',
        name: 'parameterSource',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            operation: ['getData'],
          },
        },
        options: [
          {
            name: 'Auto (From Webhook Query)',
            value: 'auto',
            description: 'Automatically get parameters from webhook query',
          },
          {
            name: 'Manual',
            value: 'manual',
            description: 'Manually set parameters',
          },
        ],
        default: 'auto',
        description: 'Where to get the parameters from',
      },
      {
        displayName: 'Parameter Source',
        name: 'parameterSource',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            operation: ['setWorkflow'],
          },
        },
        options: [
          {
            name: 'Auto (From Webhook Query)',
            value: 'auto',
            description: 'Automatically get parameters from webhook query or body',
          },
          {
            name: 'Manual',
            value: 'manual',
            description: 'Manually set parameters',
          },
        ],
        default: 'auto',
        description: 'Where to get the parameters from',
      },
      {
        displayName: 'Data Type',
        name: 'dataType',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['getData'],
            parameterSource: ['manual'],
          },
        },
        options: [
          {
            name: 'Workflows',
            value: 'workflows',
            description: 'Get list of workflows',
          },
          {
            name: 'Executions',
            value: 'executions',
            description: 'Get execution logs',
          }
        ],
        default: 'workflows',
        required: true,
        description: 'Type of data to retrieve',
      },
      {
        displayName: 'Include Disabled',
        name: 'includeDisabled',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['getData'],
            dataType: ['workflows'],
            parameterSource: ['manual'],
          },
        },
        default: false,
        description: 'Whether to include disabled workflows',
      },
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['getData'],
            dataType: ['executions'],
            parameterSource: ['manual'],
          },
        },
        required: true,
        default: '',
        description: 'The ID of the workflow to get executions for',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['getData'],
            dataType: ['executions'],
            parameterSource: ['manual'],
          },
        },
        default: 10,
        description: 'Max number of executions to return',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['getData'],
            dataType: ['executions'],
            parameterSource: ['manual'],
          },
        },
        options: [
          {
            name: 'All',
            value: 'all',
          },
          {
            name: 'Success',
            value: 'success',
          },
          {
            name: 'Error',
            value: 'error',
          },
          {
            name: 'Waiting',
            value: 'waiting',
          }
        ],
        default: 'all',
        description: 'Filter executions by status',
      },
      {
        displayName: 'Operation Type',
        name: 'operationType',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            operation: ['setWorkflow'],
            parameterSource: ['manual'],
          },
        },
        options: [
          {
            name: 'Set Status',
            value: 'setStatus',
            description: 'Enable or disable a workflow'
          }
        ],
        default: 'setStatus',
        description: 'The type of operation to perform'
      },
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['setWorkflow'],
            parameterSource: ['manual'],
          },
        },
        default: '',
        description: 'The ID of the workflow to update',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        required: true,
        displayOptions: {
          show: {
            operation: ['setWorkflow'],
            parameterSource: ['manual'],
            operationType: ['setStatus'],
          },
        },
        options: [
          {
            name: 'Enable',
            value: true,
            description: 'Enable the workflow',
          },
          {
            name: 'Disable',
            value: false,
            description: 'Disable the workflow',
          },
        ],
        default: true,
        description: 'The new status for the workflow',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    
    // 声明操作数据类型
    interface OperationData {
      workflowId?: string;
      operationType?: string;
      status?: boolean | string | number;
      triggerId?: string;
      data?: any;
    }
    
    // Declare operationData at the top level to ensure it's available in all code paths
    let operationData: OperationData = {};
    const operation = this.getNodeParameter('operation', 0);
    
    if (operation === 'getData') {
      const parameterSource = this.getNodeParameter('parameterSource', 0) as string;
      
      // 从Webhook的查询参数获取（通过输入数据）
      // 移动端通过Webhook的URL参数传递，例如：/workflows/data?type=workflows&includeDisabled=true
      // 参数来自表达式：{{ $json.query.type }}
      const inputData = this.getInputData();
      let queryParams: any = {};
      if (inputData && inputData[0]) {
        queryParams = inputData[0].json.query || {};
      }

      let dataType: string, includeDisabled: boolean, workflowId: string, statusFilter: string, limit: number;

      if (parameterSource === 'auto') {
        // 自动模式：从webhook查询参数获取
        dataType = queryParams.type || 'workflows';
        includeDisabled = queryParams.includeDisabled === 'true' || queryParams.includeDisabled === '1';
        workflowId = queryParams.workflowId || '';
        statusFilter = queryParams.status || 'all';
        limit = parseInt(queryParams.limit) || 50;
      } else {
        // 手动模式：从节点参数获取
        dataType = this.getNodeParameter('dataType', 0) as string;
        includeDisabled = this.getNodeParameter('includeDisabled', 0, false) as boolean;
        workflowId = this.getNodeParameter('workflowId', 0, '') as string;
        statusFilter = this.getNodeParameter('status', 0, 'all') as string;
        limit = this.getNodeParameter('limit', 0, 50) as number;
      }
      
      try {
        // 强制使用真实API获取数据
        let n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
        let apiKey = process.env.N8N_API_KEY;
        
        // 确保baseUrl不以/结尾
        n8nBaseUrl = n8nBaseUrl.replace(/\/$/, '');
        
        // 如果baseUrl以/api/v1结尾，则移除它，因为我们会在使用时添加
        if (n8nBaseUrl.endsWith('/api/v1')) {
          n8nBaseUrl = n8nBaseUrl.substring(0, n8nBaseUrl.length - 7);
        }
        
        // 如果没有环境变量中的API密钥，尝试从节点凭据获取
        if (!apiKey || apiKey === 'test-api-key') {
          try {
            const credentials = await this.getCredentials('n8nApi');
            if (credentials) {
              apiKey = credentials.apiKey as string;
              // 如果凭据中定义了baseUrl，使用凭据中的值
              if (credentials.baseUrl) {
                n8nBaseUrl = credentials.baseUrl as string;
                // 确保baseUrl不以/结尾
                n8nBaseUrl = n8nBaseUrl.replace(/\/$/, '');
                
                // 如果baseUrl以/api/v1结尾，则移除它，因为我们会在使用时添加
                if (n8nBaseUrl.endsWith('/api/v1')) {
                  n8nBaseUrl = n8nBaseUrl.substring(0, n8nBaseUrl.length - 7);
                }
              }
            }
          } catch (credentialError) {
            // 静默处理凭据错误
          }
        }
        
        // 验证API密钥
        if (!apiKey || apiKey.trim() === '' || apiKey === '请在此处填写您的n8n API密钥') {
          throw new Error('未配置有效的n8n API密钥。请在节点凭据中配置API密钥。');
        }
        
        if (dataType === 'workflows') {
          let workflows: any[] = [];
          
          // 如果有workflowId参数，则只获取该特定工作流的数据
          if (workflowId) {
            // 获取特定工作流的数据
            const apiEndpoint = `${n8nBaseUrl}/api/v1/workflows/${workflowId}`;
            // console.log(`尝试访问API: ${apiEndpoint}`);
            
            const response = await fetch(apiEndpoint, {
              method: 'GET',
              headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
              }
            });
            
            // 更详细的错误处理
            if (!response.ok) {
              const text = await response.text().catch(() => '无法获取响应内容');
              console.error(`API调用失败: ${response.status} ${response.statusText}`, text);
              // 返回友好的错误响应而不是抛出错误
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `API调用失败: ${response.status} ${response.statusText}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            
            // 检查响应类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              console.warn('预期JSON响应但收到:', contentType, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
              // 返回友好的错误响应
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `API返回了非JSON响应: ${contentType || '未知类型'}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            
            // 安全地解析JSON
            let responseData: any;
            try {
              responseData = await response.json();
            } catch (jsonError: any) {
              const text = await response.text();
              console.error('JSON解析错误:', jsonError);
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `JSON解析错误: ${jsonError.message || jsonError}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            const workflow = responseData.data || responseData;
            
            // 检查是否包含手动触发相关节点
            const manualTriggerNodes = [
              'n8n-nodes-base.manualTrigger', 
              'n8n-nodes-base.webhook', 
              'n8n-nodes-base.formTrigger',
              'n8n-nodes-base.chatTrigger',
              'n8n-nodes-base.chatMessage',
              'n8n-nodes-base.onChatMessage',
              'n8n-nodes-base.chat',
              'n8n-nodes-base.telegram',
              'n8n-nodes-base.discord',
              'n8n-nodes-base.slack',
              'n8n-nodes-base.microsoft-teams',
              'n8n-nodes-base.trigger',
              'n8n-nodes-base.polling',
              'n8n-nodes-base.executeWorkflowTrigger',
              'n8n-nodes-base.schedule',
              'n8n-nodes-base.scheduleTrigger',
              'n8n-nodes-base.cron',
              'n8n-nodes-base.interval',
              'n8n-nodes-base.timer',
              '@n8n/n8n-nodes-langchain.chatTrigger'
            ];
            const hasManualNodes = workflow.nodes ? workflow.nodes.some((node: any) => 
              manualTriggerNodes.includes(node.type)
            ) : false;
            
            // 获取手动触发节点详细信息
            const manualTriggerNodesInfo = hasManualNodes ? workflow.nodes
              .filter((node: any) => manualTriggerNodes.includes(node.type))
              .map((node: any) => ({
                id: node.id,
                name: node.name || '未命名节点',
                type: node.type,
                parameters: node.parameters || {},
                position: node.position || [0, 0]
              })) : [];
            
            // 标准化工作流结构
            workflows = [{
              id: workflow.id,
              name: workflow.name || '未命名工作流',
              active: workflow.active !== undefined ? workflow.active : true,
              createdAt: workflow.createdAt || new Date().toISOString(),
              updatedAt: workflow.updatedAt || new Date().toISOString(),
              nodeCount: workflow.nodes ? workflow.nodes.length : 0,
              includeManualNodes: hasManualNodes,
              // 当包含手动触发节点时，返回详细信息
              manualTriggerNodes: manualTriggerNodesInfo,
              // 包含完整的节点数据
              nodes: workflow.nodes || [],
              connections: workflow.connections || {},
              settings: workflow.settings || {},
              triggerCount: workflow.triggerCount || 0,
              tags: workflow.tags || []
            }];
            
            // 返回特定工作流的数据
            returnData.push({
              json: {
                success: true,
                data: workflows,
                total: workflows.length,
                timestamp: new Date().toISOString(),
              },
            });
            
            return [returnData];
          } else {
            // 获取所有工作流数据
            const apiEndpoint = `${n8nBaseUrl}/api/v1/workflows`;
            // console.log(`尝试访问API: ${apiEndpoint}`);
            
            const response = await fetch(apiEndpoint, {
              method: 'GET',
              headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
              }
            });
            
            // 更详细的错误处理
            if (!response.ok) {
              const text = await response.text().catch(() => '无法获取响应内容');
              console.error(`API调用失败: ${response.status} ${response.statusText}`, text);
              // 返回友好的错误响应而不是抛出错误
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `API调用失败: ${response.status} ${response.statusText}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            
            // 检查响应类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              console.warn('预期JSON响应但收到:', contentType, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
              // 返回友好的错误响应
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `API返回了非JSON响应: ${contentType || '未知类型'}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            
            // 安全地解析JSON
            let responseData: any;
            try {
              responseData = await response.json();
            } catch (jsonError: any) {
              const text = await response.text();
              console.error('JSON解析错误:', jsonError);
              returnData.push({
                json: {
                  success: false,
                  operation: 'getData',
                  message: `JSON解析错误: ${jsonError.message || jsonError}`,
                  apiUrl: apiEndpoint,
                  responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                },
              });
              return [returnData];
            }
            
            // 确保工作流数据结构标准化
            let processedWorkflows = responseData.data || [];
            processedWorkflows = processedWorkflows.map((w: any) => {
              // 检查是否包含手动触发相关节点
              const manualTriggerNodes = [
                'n8n-nodes-base.manualTrigger', 
                'n8n-nodes-base.webhook', 
                'n8n-nodes-base.formTrigger',
                'n8n-nodes-base.chatTrigger',
                'n8n-nodes-base.chatMessage',
                'n8n-nodes-base.onChatMessage',
                'n8n-nodes-base.chat',
                'n8n-nodes-base.telegram',
                'n8n-nodes-base.discord',
                'n8n-nodes-base.slack',
                'n8n-nodes-base.microsoft-teams',
                'n8n-nodes-base.trigger',
                'n8n-nodes-base.polling',
                'n8n-nodes-base.executeWorkflowTrigger',
                'n8n-nodes-base.schedule',
                'n8n-nodes-base.scheduleTrigger',
                'n8n-nodes-base.cron',
                'n8n-nodes-base.interval',
                'n8n-nodes-base.timer',
                '@n8n/n8n-nodes-langchain.chatTrigger'
              ];
              const hasManualNodes = w.nodes ? w.nodes.some((node: any) => 
                manualTriggerNodes.includes(node.type)
              ) : false;
              
              // 获取手动触发节点详细信息
              const manualTriggerNodesInfo = hasManualNodes ? w.nodes
                .filter((node: any) => manualTriggerNodes.includes(node.type))
                .map((node: any) => ({
                  id: node.id,
                  name: node.name || '未命名节点',
                  type: node.type,
                  parameters: node.parameters || {},
                  position: node.position || [0, 0]
                })) : [];
              
              return {
                id: w.id,
                name: w.name || '未命名工作流',
                active: w.active !== undefined ? w.active : true,
                createdAt: w.createdAt || new Date().toISOString(),
                updatedAt: w.updatedAt || new Date().toISOString(),
                nodeCount: w.nodes ? w.nodes.length : 0,
                includeManualNodes: hasManualNodes,
                // 当包含手动触发节点时，返回详细信息
                manualTriggerNodes: manualTriggerNodesInfo
              };
            });
            
            // 根据includeDisabled参数过滤工作流
            let resultWorkflows = processedWorkflows;
            if (!includeDisabled) {
              resultWorkflows = resultWorkflows.filter((workflow: any) => workflow.active === true);
            }
            
            returnData.push({
              json: {
                success: true,
                data: resultWorkflows,
                total: resultWorkflows.length,
                timestamp: new Date().toISOString(),
              },
            });
          }
          
          return [returnData];
        } else if (dataType === 'executions') {
          // 获取执行数据
          if (!workflowId) {
            throw new Error('获取执行记录需要指定工作流ID');
          }
          
          // 构建查询参数
          const queryParams = new URLSearchParams();
          if (statusFilter !== 'all') {
            queryParams.append('status', statusFilter);
          }
          queryParams.append('limit', limit.toString());
          
          const response = await fetch(`${n8nBaseUrl}/api/v1/executions?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'X-N8N-API-KEY': apiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`获取执行记录失败: ${response.status} ${response.statusText}`);
          }
          
          let responseData: any = await response.json();
          let executions: any[] = responseData.data || [];
          
          // 按工作流ID过滤执行记录
          if (workflowId) {
            executions = executions.filter((execution: any) => execution.workflowId === workflowId);
          }
          
          // 标准化执行记录结构
          const standardizedExecutions = executions.map((e: any) => ({
            id: e.id,
            workflowId: e.workflowId,
            status: e.status,
            startedAt: e.startedAt,
            stoppedAt: e.stoppedAt || e.finishedAt,
            executionTime: e.stoppedAt ? 
              new Date(e.stoppedAt).getTime() - new Date(e.startedAt).getTime() : null
          }));
          
          returnData.push({
            json: {
              success: true,
              data: standardizedExecutions,
              total: standardizedExecutions.length,
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
      catch (error: any) {
        console.error('Error in MobileApp node:', error);
        returnData.push({
          json: {
            success: false,
            operation: operationData.operationType || 'unknown',
            message: error.message || String(error),
            timestamp: new Date().toISOString(),
            error: error.toString(),
          },
        });
      }
    }
    else if (operation === 'setWorkflow') {
      // Reuse the top-level operationData variable
      operationData = {} as OperationData;
      try {
        const parameterSource = this.getNodeParameter('parameterSource', 0) as string;

        if (parameterSource === 'auto') {
          // 从webhook查询参数或请求体中自动获取参数
          const inputData = this.getInputData();
          
          let queryParams: any = {};
          let requestBody: any = {};
          
          if (inputData && inputData[0] && inputData[0].json) {
            queryParams = inputData[0].json.query || {};
            requestBody = inputData[0].json.body || {};
          }
          
          // 合并查询参数和请求体
          const mergedParams: any = { ...queryParams, ...requestBody };
          
          // 必须包含workflowId和operationType
          if (!mergedParams.workflowId) {
            throw new Error('Missing required parameter: workflowId');
          }
          
          if (!mergedParams.operationType) {
            throw new Error('Missing required parameter: operationType');
          }
          
          // 正确处理各种类型的status值，确保false值被正确保留
          let statusValue: boolean | string | number = false;
          if (typeof mergedParams.status === 'boolean') {
            statusValue = mergedParams.status;
          } else if (typeof mergedParams.status === 'string') {
            const lowerStatus = mergedParams.status.toLowerCase();
            if (lowerStatus === 'false' || lowerStatus === '0') {
              statusValue = false;
            } else {
              statusValue = lowerStatus === 'true' || lowerStatus === '1';
            }
          } else if (typeof mergedParams.status === 'number') {
            statusValue = mergedParams.status === 1;
          }
          
          operationData = {
            workflowId: mergedParams.workflowId,
            operationType: mergedParams.operationType,
            status: statusValue,
            triggerId: mergedParams.triggerId,
            data: mergedParams.data ? JSON.parse(typeof mergedParams.data === 'string' ? mergedParams.data : JSON.stringify(mergedParams.data)) : {},
          };
        } else {
          // 手动设置参数
          const operationType = this.getNodeParameter('operationType', 0) as string;
          const workflowId = this.getNodeParameter('workflowId', 0) as string;
          
          operationData = {
            workflowId,
            operationType,
          };
          
          // 根据操作类型获取相应参数
          if (operationType === 'setStatus') {
            const statusValue = this.getNodeParameter('status', 0);
            // 确保状态值正确转换为布尔类型，兼容字符串形式，特别注意处理false值
            let parsedStatus = false;
            if (typeof statusValue === 'boolean') {
              parsedStatus = statusValue;
            } else if (typeof statusValue === 'string') {
              const lowerStatus = statusValue.toLowerCase();
              if (lowerStatus === 'false' || lowerStatus === '0') {
                parsedStatus = false;
              } else {
                parsedStatus = lowerStatus === 'true' || lowerStatus === '1';
              }
            } else if (typeof statusValue === 'number') {
              parsedStatus = statusValue === 1;
            }
            (operationData as OperationData).status = parsedStatus;
          }
        }

        // 强制使用真实API调用
        let n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
        let apiKey = process.env.N8N_API_KEY;
        
        // 确保baseUrl不以/结尾
        n8nBaseUrl = n8nBaseUrl.replace(/\/$/, '');
        
        // 如果baseUrl以/api/v1结尾，则移除它，因为我们会在使用时添加
        if (n8nBaseUrl.endsWith('/api/v1')) {
          n8nBaseUrl = n8nBaseUrl.substring(0, n8nBaseUrl.length - 7);
        }
        
        // 如果没有环境变量中的API密钥，尝试从节点凭据获取
        if (!apiKey || apiKey === 'test-api-key') {
          try {
            const credentials = await this.getCredentials('n8nApi');
            if (credentials) {
              apiKey = credentials.apiKey as string;
              // 如果凭据中定义了baseUrl，使用凭据中的值
              if (credentials.baseUrl) {
                n8nBaseUrl = credentials.baseUrl as string;
                // 确保baseUrl不以/结尾
                n8nBaseUrl = n8nBaseUrl.replace(/\/$/, '');
                
                // 如果baseUrl以/api/v1结尾，则移除它，因为我们会在使用时添加
                if (n8nBaseUrl.endsWith('/api/v1')) {
                  n8nBaseUrl = n8nBaseUrl.substring(0, n8nBaseUrl.length - 7);
                }
              }
            }
          } catch (credentialError) {
            // 静默处理凭据错误
          }
        }
        
        // 验证API密钥
        if (!apiKey || apiKey.trim() === '' || apiKey === '请在此处填写您的n8n API密钥') {
          throw new Error('未配置有效的n8n API密钥。请在节点凭据中配置API密钥。');
        }

        // 清理workflowId
        const cleanWorkflowId = (operationData as OperationData).workflowId!.toString().trim();
        
        // 根据操作类型执行不同的API调用
        if ((operationData as OperationData).operationType === 'setStatus') {
          // 强制转换状态值为布尔值，确保字符串'true'/'false'和数字值被正确处理
          let status = (operationData as OperationData).status;
          // 明确处理各种可能的输入值，确保false值被正确识别
          if (typeof status !== 'boolean') {
            if (typeof status === 'string') {
              const lowerStatus = (status as string).toLowerCase();
              if (lowerStatus === 'false' || lowerStatus === '0') {
                status = false;
              } else {
                status = lowerStatus === 'true' || lowerStatus === '1';
              }
            } else if (typeof status === 'number') {
              status = status === 1;
            } else {
              status = false;
            }
          }
          
          // 使用专门的activate/deactivate端点来设置工作流状态
          const endpoint = status ? 'activate' : 'deactivate';
          const apiUrl = `${n8nBaseUrl}/api/v1/workflows/${cleanWorkflowId}/${endpoint}`;
          
          const updateResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'X-N8N-API-KEY': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          });
          
          // 错误处理
          if (!updateResponse.ok) {
            const text = await updateResponse.text().catch(() => '无法获取响应内容');
            returnData.push({
              json: {
                success: false,
                operation: 'setStatus',
                message: `API调用失败: ${updateResponse.status} ${updateResponse.statusText}`,
                apiUrl: apiUrl,
                responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
              },
            });
            return [returnData];
          }
          
          // 检查响应类型
          const contentType = updateResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await updateResponse.text();
            returnData.push({
              json: {
                success: false,
                operation: 'setStatus',
                message: `API返回了非JSON响应: ${contentType || '未知类型'}`,
                apiUrl: apiUrl,
                responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
              },
            });
            return [returnData];
          }
          
          // 解析JSON响应
          let updateData: any;
          try {
            updateData = await updateResponse.json();
          } catch (jsonError: any) {
            const text = await updateResponse.text();
            returnData.push({
              json: {
                success: false,
                operation: 'setStatus',
                message: `JSON解析错误: ${jsonError.message || jsonError}`,
                apiUrl: apiUrl,
                responseSample: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
              },
            });
            return [returnData];
          }
          
          returnData.push({
            json: {
              success: true,
              workflowId: cleanWorkflowId,
              operation: 'setStatus',
              status: status ? 'enabled' : 'disabled',
              message: status ? '工作流已成功启用' : '工作流已成功禁用',
              data: updateData.data || updateData,
            },
          });
        } else {
          throw new Error(`Invalid operation type: ${(operationData as OperationData).operationType || 'undefined'}`);
        }
      }
      catch (error: any) {
        returnData.push({
          json: {
            success: false,
            error: error.message || String(error),
          },
        });
      }
    }

    return [returnData];
  }
}