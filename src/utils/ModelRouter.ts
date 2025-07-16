// Model Router - Intent-based AI model selection
export interface RequestData {
  intent: string;
  complexity: 'low' | 'medium' | 'high';
  contentType?: string;
  language?: string;
}

export interface ModelSelection {
  model: string;
  provider: string;
  reason: string;
}

export class ModelRouter {
  private modelMap: { [key: string]: ModelSelection } = {
    'code_analysis': {
      model: 'deepseek-coder',
      provider: 'deepseek',
      reason: 'Code analysis task detected'
    },
    'creative_writing': {
      model: 'claude-3-sonnet',
      provider: 'claude',
      reason: 'Creative tasks optimized for Claude'
    },
    'data_analysis': {
      model: 'gemini-pro',
      provider: 'google',
      reason: 'Data processing capabilities'
    },
    'general_conversation': {
      model: 'gpt-4o-mini',
      provider: 'openai',
      reason: 'Fast general purpose responses'
    },
    'translation': {
      model: 'gpt-4o',
      provider: 'openai',
      reason: 'Multi-language support'
    }
  };

  selectOptimalModel(requestData: RequestData): ModelSelection {
    const { intent, complexity, language } = requestData;
    
    // Complexity-based override
    if (complexity === 'high') {
      if (intent === 'code_analysis') {
        return {
          model: 'deepseek-coder',
          provider: 'deepseek',
          reason: 'High complexity code task'
        };
      }
      if (intent === 'creative_writing') {
        return {
          model: 'claude-3-opus',
          provider: 'claude',
          reason: 'High complexity creative task'
        };
      }
    }
    
    // Language-specific routing
    if (language && intent === 'code_analysis') {
      return {
        model: 'deepseek-coder',
        provider: 'deepseek',
        reason: `${language} specific optimization`
      };
    }
    
    // Default selection
    return this.modelMap[intent] || {
      model: 'gpt-4o-mini',
      provider: 'openai',
      reason: 'Default fallback model'
    };
  }
}