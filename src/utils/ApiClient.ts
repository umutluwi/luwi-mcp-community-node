import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ModelSelection } from './ModelRouter';
import { UnifiedResponse, ResponseMapper } from './ResponseMapper';

export interface ApiCredentials {
  openaiApiKey?: string;
  claudeApiKey?: string;
  googleApiKey?: string;
  deepseekApiKey?: string;
}

export class ApiClient {
  private responseMapper: ResponseMapper;
  
  constructor(private credentials: ApiCredentials) {
    this.responseMapper = new ResponseMapper();
  }

  async callModel(modelSelection: ModelSelection, prompt: string): Promise<UnifiedResponse> {
    const startTime = Date.now();
    
    try {
      switch (modelSelection.provider) {
        case 'openai':
          return await this.callOpenAI(modelSelection.model, prompt, startTime);
        case 'claude':
          return await this.callClaude(modelSelection.model, prompt, startTime);
        case 'google':
          return await this.callGemini(modelSelection.model, prompt, startTime);
        case 'deepseek':
          return await this.callDeepSeek(modelSelection.model, prompt, startTime);
        default:
          throw new Error(`Unsupported provider: ${modelSelection.provider}`);
      }
    } catch (error) {
      return this.responseMapper.mapOpenAIResponse(
        { error: error },
        modelSelection.model,
        startTime
      );
    }
  }

  private async callOpenAI(model: string, prompt: string, startTime: number): Promise<UnifiedResponse> {
    const client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${this.credentials.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await client.post('/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return this.responseMapper.mapOpenAIResponse(response.data, model, startTime);
  }

  private async callClaude(model: string, prompt: string, startTime: number): Promise<UnifiedResponse> {
    const client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': this.credentials.claudeApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    const response = await client.post('/messages', {
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.responseMapper.mapClaudeResponse(response.data, model, startTime);
  }

  private async callGemini(model: string, prompt: string, startTime: number): Promise<UnifiedResponse> {
    const client = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await client.post(`/models/${model}:generateContent?key=${this.credentials.googleApiKey}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    return this.responseMapper.mapGeminiResponse(response.data, model, startTime);
  }

  private async callDeepSeek(model: string, prompt: string, startTime: number): Promise<UnifiedResponse> {
    const client = axios.create({
      baseURL: 'https://api.deepseek.com/v1',
      headers: {
        'Authorization': `Bearer ${this.credentials.deepseekApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const response = await client.post('/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return this.responseMapper.mapDeepSeekResponse(response.data, model, startTime);
  }
}