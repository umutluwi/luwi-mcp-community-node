import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class LuwiMcpApi implements ICredentialType {
  name = 'luwiMcpApi';
  displayName = 'Luwi MCP API';
  properties: INodeProperties[] = [
    {
      displayName: 'OpenAI API Key',
      name: 'openaiApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'OpenAI API key for GPT models',
    },
    {
      displayName: 'Claude API Key',
      name: 'claudeApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Anthropic API key for Claude models',
    },
    {
      displayName: 'Google API Key',
      name: 'googleApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Google API key for Gemini models',
    },
    {
      displayName: 'DeepSeek API Key',
      name: 'deepseekApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'DeepSeek API key for DeepSeek models',
    },
  ];
}