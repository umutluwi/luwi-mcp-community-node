# 🚀 Luwi MCP Community Node - MVP

Multi-model AI orchestration for n8n workflows with intelligent routing and fallback mechanisms.

## 🎯 Features

- **🧠 Intelligent Model Routing**: Automatically selects optimal AI model based on task intent
- **🔄 Fallback Support**: Seamless fallback to alternative models if primary fails
- **📊 Unified Response Format**: Consistent JSON response across all AI providers
- **⚡ Multi-Provider Support**: OpenAI, Claude, Gemini, and DeepSeek integration
- **🛡️ Error Handling**: Comprehensive error handling and retry logic

## 📦 Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Link to n8n:
   ```bash
   npm link
   ```

## 🔧 Configuration

### Credentials Setup

1. Go to n8n Settings → Credentials
2. Add "Luwi MCP API" credential
3. Enter your API keys:
   - OpenAI API Key
   - Claude API Key (Anthropic)
   - Google API Key (for Gemini)
   - DeepSeek API Key

### Node Configuration

- **Operation**: Generate or Analyze
- **Prompt**: Your input text
- **Intent**: Task type (code_analysis, creative_writing, etc.)
- **Complexity**: Task complexity level
- **Language**: Programming/natural language (optional)
- **Enable Fallback**: Use backup models if primary fails

## 🎪 Usage Examples

### Code Analysis
```json
{
  "operation": "analyze",
  "prompt": "Review this JavaScript function for bugs",
  "intent": "code_analysis",
  "complexity": "medium",
  "language": "javascript"
}
```

### Creative Writing
```json
{
  "operation": "generate",
  "prompt": "Write a product description for a smart watch",
  "intent": "creative_writing",
  "complexity": "high"
}
```

### Data Analysis
```json
{
  "operation": "analyze",
  "prompt": "Analyze sales trends in this dataset",
  "intent": "data_analysis",
  "complexity": "high"
}
```

## 🏗️ Architecture

```
src/
├── nodes/
│   └── LuwiMcp/
│       └── LuwiMcp.node.ts     # Main node implementation
├── credentials/
│   └── LuwiMcpApi.credentials.ts # API credentials
└── utils/
    ├── ModelRouter.ts           # Model selection logic
    ├── ResponseMapper.ts        # Response normalization
    └── ApiClient.ts            # API communication
```

## 📊 Model Routing Logic

| Intent | Primary Model | Provider | Fallback |
|--------|---------------|----------|----------|
| Code Analysis | deepseek-coder | DeepSeek | GPT-4o |
| Creative Writing | claude-3-sonnet | Claude | GPT-4o |
| Data Analysis | gemini-pro | Google | GPT-4o |
| General | gpt-4o-mini | OpenAI | Claude |
| Translation | gpt-4o | OpenAI | Claude |

## 🔄 Response Format

```json
{
  "success": true,
  "data": {
    "content": "Generated content here",
    "model": "gpt-4o-mini",
    "provider": "openai",
    "timestamp": "2024-01-01T00:00:00Z",
    "metadata": {
      "tokens_used": 150,
      "cost": 0.0003,
      "latency_ms": 1200,
      "model_version": "gpt-4o-mini-2024-07-18"
    }
  }
}
```

## 🛡️ Error Handling

- **Automatic Retry**: Failed requests automatically retry with fallback models
- **Graceful Degradation**: Continues workflow execution even if AI call fails
- **Detailed Logging**: Comprehensive error reporting with context

## 🔮 Future Enhancements

- [ ] Custom model routing rules
- [ ] Advanced cost optimization
- [ ] Streaming response support
- [ ] Rate limiting and quota management
- [ ] Advanced analytics and monitoring

## 🤝 Contributing

This is an MVP version. We welcome contributions!

1. Fork the repository
2. Create feature branch
3. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- GitHub Issues: [Report bugs](https://github.com/umutluwi/luwi-mcp-community-node/issues)
- Discord: [Join community](https://discord.gg/luwi)
- Email: community@luwi.org

---

**Built with ❤️ by Luwi Community**