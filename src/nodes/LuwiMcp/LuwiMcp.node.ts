import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

import { ModelRouter, RequestData } from '../../utils/ModelRouter';
import { ApiClient } from '../../utils/ApiClient';

export class LuwiMcp implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Luwi MCP',
    name: 'luwiMcp',
    icon: 'file:luwi-mcp.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Multi-model AI orchestration with intelligent routing',
    defaults: {
      name: 'Luwi MCP',
    },
    inputs: ['main' as NodeConnectionType],
    outputs: ['main' as NodeConnectionType],
    credentials: [
      {
        name: 'luwiMcpApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Generate',
            value: 'generate',
            description: 'Generate content using optimal AI model',
            action: 'Generate content',
          },
          {
            name: 'Analyze',
            value: 'analyze',
            description: 'Analyze content using optimal AI model',
            action: 'Analyze content',
          },
        ],
        default: 'generate',
      },
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        placeholder: 'Enter your prompt here...',
        description: 'The prompt to send to the AI model',
        required: true,
      },
      {
        displayName: 'Intent',
        name: 'intent',
        type: 'options',
        options: [
          {
            name: 'Code Analysis',
            value: 'code_analysis',
            description: 'Code review, debugging, optimization',
          },
          {
            name: 'Creative Writing',
            value: 'creative_writing',
            description: 'Creative content, storytelling, copywriting',
          },
          {
            name: 'Data Analysis',
            value: 'data_analysis',
            description: 'Data processing, analysis, insights',
          },
          {
            name: 'General Conversation',
            value: 'general_conversation',
            description: 'General questions and conversations',
          },
          {
            name: 'Translation',
            value: 'translation',
            description: 'Language translation tasks',
          },
        ],
        default: 'general_conversation',
        description: 'The intent/purpose of your request',
      },
      {
        displayName: 'Complexity',
        name: 'complexity',
        type: 'options',
        options: [
          {
            name: 'Low',
            value: 'low',
            description: 'Simple, straightforward tasks',
          },
          {
            name: 'Medium',
            value: 'medium',
            description: 'Moderate complexity tasks',
          },
          {
            name: 'High',
            value: 'high',
            description: 'Complex, detailed tasks',
          },
        ],
        default: 'medium',
        description: 'The complexity level of your request',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'string',
        default: '',
        placeholder: 'e.g., javascript, python, english',
        description: 'Programming language or natural language (optional)',
        displayOptions: {
          show: {
            intent: ['code_analysis', 'translation'],
          },
        },
      },
      {
        displayName: 'Enable Fallback',
        name: 'enableFallback',
        type: 'boolean',
        default: true,
        description: 'Whether to use fallback models if primary model fails',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const prompt = this.getNodeParameter('prompt', i) as string;
        const intent = this.getNodeParameter('intent', i) as string;
        const complexity = this.getNodeParameter('complexity', i) as 'low' | 'medium' | 'high';
        const language = this.getNodeParameter('language', i, '') as string;
        const enableFallback = this.getNodeParameter('enableFallback', i) as boolean;

        // Get credentials
        const credentials = await this.getCredentials('luwiMcpApi');

        if (!prompt) {
          throw new NodeOperationError(this.getNode(), 'Prompt is required');
        }

        // Initialize components
        const modelRouter = new ModelRouter();
        const apiClient = new ApiClient({
          openaiApiKey: credentials.openaiApiKey as string,
          claudeApiKey: credentials.claudeApiKey as string,
          googleApiKey: credentials.googleApiKey as string,
          deepseekApiKey: credentials.deepseekApiKey as string,
        });

        // Prepare request data
        const requestData: RequestData = {
          intent,
          complexity,
          language: language || undefined,
          contentType: operation,
        };

        // Select optimal model
        const modelSelection = modelRouter.selectOptimalModel(requestData);

        // Call the API
        const response = await apiClient.callModel(modelSelection, prompt);

        // Handle fallback if enabled and primary call failed
        if (!response.success && enableFallback) {
          // Try alternative models based on intent
          const fallbackModels: string[] = [];
          
          for (const fallbackModel of fallbackModels) {
            const fallbackResponse = await apiClient.callModel(fallbackModel, prompt);
            if (fallbackResponse.success) {
              response.data = fallbackResponse.data;
              response.success = true;
              response.data.metadata = {
                ...response.data.metadata,
                // fallback_used: true,
                // original_model: modelSelection.model,
                fallback_model: fallbackModel.model,
              };
              break;
            }
          }
        }

        if (!response.success) {
          throw new NodeOperationError(
            this.getNode(),
            `AI request failed: ${response.error?.message || 'Unknown error'}`,
            { itemIndex: i }
          );
        }

        returnData.push({
          json: {
            ...response.data,
            operation,
            original_prompt: prompt,
            selected_model: modelSelection,
          },
          pairedItem: {
            item: i,
          },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
              success: false,
            },
            pairedItem: {
              item: i,
            },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}