# @llmonitor/sdk

**Model-agnostic LLM Observability & Cost Intelligence**

Monitor, track, and optimize your LLM usage across any provider with just 3 lines of code.

## 🚀 Quick Start

```bash
npm install @llmonitor/sdk
```

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

// 1. Initialize LLMonitor
const monitor = new LLMonitor({
  apiKey: "your-api-key", // Get this from your LLMonitor dashboard
  // baseURL es opcional, por defecto https://api.llmonitor.io
});

// 2. Wrap your LLM client
const openai = monitor.openai(new OpenAI({ apiKey: "your-openai-key" }));

// 3. Use exactly like normal - automatically logged!
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

That's it! Every request is now automatically tracked with:

- ✅ **Token usage & costs**
- ✅ **Latency metrics**
- ✅ **Error tracking**
- ✅ **Session grouping**

## 🏃‍♂️ Get Your API Key

1. **Sign up** at [LLMonitor Dashboard](https://llmonitor.io)
2. **Organization created automatically** - No setup needed!
3. **Copy your API key** from Settings

> Your organization and API key are created automatically when you sign up - no manual configuration required!

## 📊 What Gets Tracked

- **Costs**: Automatic cost calculation for all major providers
- **Performance**: Latency, token usage, success rates
- **Context**: Sessions, versions, custom metadata
- **Errors**: Failed requests with detailed error info

## 🎯 Supported Providers

| Provider      | Support | Auto-Pricing | Models                 |
| ------------- | ------- | ------------ | ---------------------- |
| **OpenAI**    | ✅ Full | ✅           | GPT-4, GPT-3.5, GPT-4o |
| **Anthropic** | ✅ Full | ✅           | Claude-3, Claude-3.5   |
| **Google AI** | ✅ Full | ✅           | Gemini Pro, Flash      |
| **Cohere**    | ✅ Full | ✅           | Command, Command-R     |

## 📖 Provider Examples

### OpenAI

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const openai = monitor.openai(new OpenAI());

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Explain quantum computing" }],
});
```

### Anthropic

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import Anthropic from "@anthropic-ai/sdk";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const anthropic = monitor.anthropic(new Anthropic());

const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1000,
  messages: [{ role: "user", content: "Write a haiku about code" }],
});
```

### Google AI

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = monitor.google(genAI.getGenerativeModel({ model: "gemini-pro" }));

const result = await model.generateContent("Explain machine learning");
```

## ⚙️ Configuration

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...", // Required: Your LLMonitor API key
  // baseURL es opcional, por defecto https://api.llmonitor.io
  sessionId: "user-123", // Optional: Group requests by session
  versionTag: "v1.2.0", // Optional: Track different versions
  debug: true, // Optional: Enable debug logging
  enabled: true, // Optional: Toggle monitoring
  metadata: {
    // Optional: Custom metadata
    userId: "user-123",
    feature: "chat",
  },
});
```

## 🔧 Express.js Middleware

Track all LLM calls across your Express app:

```typescript
import express from "express";
import { LLMonitor } from "@llmonitor/sdk";

const app = express();
const monitor = new LLMonitor({ apiKey: "llm_..." });

// Add middleware
app.use(monitor.express({
  sessionId: (req) => req.user?.id,
  metadata: (req) => ({ route: req.route?.path })
}));

// Now all LLM calls in your routes are automatically tracked
app.post("/chat", async (req, res) => {
  const openai = monitor.openai(new OpenAI());
  const response = await openai.chat.completions.create({...});
  res.json(response);
});
```

## 🎛️ Advanced Usage

### Session Tracking

Group related requests together:

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  sessionId: "conversation-abc-123",
});

// All requests will be grouped under this session
```

### Version Tagging

Track different prompt versions:

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  versionTag: "prompt-v2.1",
});
```

### Per-Request Options

Override config for specific requests:

```typescript
const openai = monitor.openai(new OpenAI());

await openai.chat.completions.create(
  {
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }],
  },
  {
    sessionId: "special-session",
    versionTag: "experimental",
    metadata: { feature: "onboarding" },
  }
);
```

### Manual Event Logging

For custom integrations:

```typescript
await monitor.logEvent({
  provider: "custom",
  model: "my-model",
  prompt: "Hello world",
  completion: "Hi there!",
  prompt_tokens: 10,
  completion_tokens: 5,
  latency_ms: 250,
  status: 200,
  cost_usd: 0.001,
});
```

## 🔄 Error Handling

The SDK gracefully handles errors and never interrupts your LLM calls:

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  debug: true  // See any monitoring errors in console
});

// Even if LLMonitor is down, your OpenAI calls continue normally
const openai = monitor.openai(new OpenAI());
const response = await openai.chat.completions.create({...}); // Always works
```

## 🏗️ TypeScript Support

Full TypeScript support with proper types:

```typescript
import { LLMonitor, LLMEvent, LLMonitorConfig } from "@llmonitor/sdk";

const config: LLMonitorConfig = {
  apiKey: "llm_...",
  debug: true,
};

const monitor = new LLMonitor(config);
```

## 📚 Links

- [Dashboard](https://llmonitor.io) - View your metrics
- [Documentation](https://docs.llmonitor.io) - Complete guides
- [GitHub](https://github.com/agusgarcia3007/LLMonitor) - Source code

## 🤝 Contributing

We love contributions! Check out our [contributing guide](CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file.
