// Unified Response Mapper - Standardizes responses from different AI models
export interface UnifiedResponse {
  success: boolean;
  data: {
    content: string;
    model: string;
    provider: string;
    timestamp: string;
    metadata: {
      tokens_used?: number;
      cost?: number;
      latency_ms: number;
      model_version?: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ResponseMapper {
  mapOpenAIResponse(response: any, model: string, startTime: number): UnifiedResponse {
    const latency = Date.now() - startTime;
    
    try {
      return {
        success: true,
        data: {
          content: response.choices[0].message.content,
          model,
          provider: 'openai',
          timestamp: new Date().toISOString(),
          metadata: {
            tokens_used: response.usage?.total_tokens,
            cost: this.calculateOpenAICost(response.usage?.total_tokens, model),
            latency_ms: latency,
            model_version: response.model
          }
        }
      };
    } catch (error) {
      return this.createErrorResponse(error, model, 'openai', latency);
    }
  }

  mapClaudeResponse(response: any, model: string, startTime: number): UnifiedResponse {
    const latency = Date.now() - startTime;
    
    try {
      return {
        success: true,
        data: {
          content: response.content[0].text,
          model,
          provider: 'claude',
          timestamp: new Date().toISOString(),
          metadata: {
            tokens_used: response.usage?.output_tokens + response.usage?.input_tokens,
            cost: this.calculateClaudeCost(response.usage, model),
            latency_ms: latency,
            model_version: response.model
          }
        }
      };
    } catch (error) {
      return this.createErrorResponse(error, model, 'claude', latency);
    }
  }

  mapGeminiResponse(response: any, model: string, startTime: number): UnifiedResponse {
    const latency = Date.now() - startTime;
    
    try {
      return {
        success: true,
        data: {
          content: response.candidates[0].content.parts[0].text,
          model,
          provider: 'google',
          timestamp: new Date().toISOString(),
          metadata: {
            tokens_used: response.usageMetadata?.totalTokenCount,
            cost: this.calculateGeminiCost(response.usageMetadata?.totalTokenCount, model),
            latency_ms: latency,
            model_version: model
          }
        }
      };
    } catch (error) {
      return this.createErrorResponse(error, model, 'google', latency);
    }
  }

  mapDeepSeekResponse(response: any, model: string, startTime: number): UnifiedResponse {
    const latency = Date.now() - startTime;
    
    try {
      return {
        success: true,
        data: {
          content: response.choices[0].message.content,
          model,
          provider: 'deepseek',
          timestamp: new Date().toISOString(),
          metadata: {
            tokens_used: response.usage?.total_tokens,
            cost: this.calculateDeepSeekCost(response.usage?.total_tokens, model),
            latency_ms: latency,
            model_version: response.model
          }
        }
      };
    } catch (error) {
      return this.createErrorResponse(error, model, 'deepseek', latency);
    }
  }

  private createErrorResponse(error: any, model: string, provider: string, latency: number): UnifiedResponse {
    return {
      success: false,
      data: {
        content: '',
        model,
        provider,
        timestamp: new Date().toISOString(),
        metadata: {
          latency_ms: latency
        }
      },
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error
      }
    };
  }

  private calculateOpenAICost(tokens: number, model: string): number {
    // Simplified cost calculation - should be updated with actual pricing
    const costPerToken = model.includes('gpt-4') ? 0.00003 : 0.000002;
    return tokens * costPerToken;
  }

  private calculateClaudeCost(usage: any, model: string): number {
    // Simplified cost calculation
    const inputCost = (usage?.input_tokens || 0) * 0.000015;
    const outputCost = (usage?.output_tokens || 0) * 0.000075;
    return inputCost + outputCost;
  }

  private calculateGeminiCost(tokens: number, model: string): number {
    // Simplified cost calculation
    return tokens * 0.000001;
  }

  private calculateDeepSeekCost(tokens: number, model: string): number {
    // Simplified cost calculation
    return tokens * 0.000001;
  }
}