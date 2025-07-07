# llmonitor

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

```js
// CommonJS (require) usage
const { LLMonitor } = require("@llmonitor/sdk");
const OpenAI = require("openai");

const monitor = new LLMonitor({ apiKey: "your-api-key" });
const openai = monitor.openai(new OpenAI({ apiKey: "your-openai-key" }));

openai.chat.completions
  .create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  })
  .then(console.log);
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

## 🎯 Supported Features

| Feature        | Support | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| **Chat**       | ✅ Full | Regular and streaming chat completions       |
| **Embeddings** | ✅ Full | Text embeddings with automatic cost tracking |
| **Streaming**  | ✅ Full | Real-time streaming with accumulated metrics |

## 🎯 Supported Providers

| Provider      | Support | Auto-Pricing | Models                           |
| ------------- | ------- | ------------ | -------------------------------- |
| **OpenAI**    | ✅ Full | ✅           | GPT-4, GPT-3.5, GPT-4o           |
| **Anthropic** | ✅ Full | ✅           | Claude-3, Claude-3.5             |
| **Google AI** | ✅ Full | ✅           | Gemini Pro, Flash                |
| **Cohere**    | ✅ Full | ✅           | Command, Command-R               |
| **DeepSeek**  | ✅ Full | ✅           | deepseek-chat, deepseek-reasoner |

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

### DeepSeek

DeepSeek is fully compatible with the OpenAI SDK. You just need to use the OpenAI SDK and set the `baseURL` to DeepSeek along with your DeepSeek API key. You can use the models `deepseek-chat` or `deepseek-reasoner`.

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const deepseek = monitor.deepseek(
  new OpenAI({
    apiKey: "your-deepseek-key",
    baseURL: "https://api.deepseek.com",
  })
);

const response = await deepseek.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "What is DeepSeek?" }],
});
```

> **Note:** You can use any client compatible with the OpenAI API, just make sure to set the `baseURL` to `https://api.deepseek.com` and use your DeepSeek API key. More details in the [official DeepSeek documentation](https://api-docs.deepseek.com/).

## 🧑‍💻 CommonJS (require) usage

Si usas Node.js clásico o una API vieja:

```js
const { LLMonitor } = require("@llmonitor/sdk");
const OpenAI = require("openai");

const monitor = new LLMonitor({ apiKey: "llm_..." });
const openai = monitor.openai(new OpenAI());

openai.chat.completions
  .create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  })
  .then(console.log);
```

También funciona con DeepSeek:

```js
const { LLMonitor } = require("@llmonitor/sdk");
const DeepSeek = require("deepseek-openai");

const monitor = new LLMonitor({ apiKey: "llm_..." });
const deepseek = monitor.deepseek(
  new DeepSeek({ apiKey: "your-deepseek-key" })
);

deepseek.chat.completions
  .create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: "What is DeepSeek?" }],
  })
  .then(console.log);
```

## 🌟 Feature Examples

### Embeddings Support

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const openai = monitor.openai(new OpenAI());

// Create embeddings - automatically tracked!
const embeddings = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text to embed here",
});

console.log(embeddings.data[0].embedding);
```

### Streaming Support

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

const monitor = new LLMonitor({ apiKey: "llm_..." });
const openai = monitor.openai(new OpenAI());

// Stream chat completions - automatically tracked!
const stream = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Tell me a story" }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices?.[0]?.delta?.content || "";
  process.stdout.write(content);
}
```

### Complete RAG Example

```typescript
// Your existing RAG workflow - just add monitoring!
const monitor = new LLMonitor({
  apiKey: "llm_...",
  sessionId: "user-123",
  metadata: { feature: "rag-chat" },
});
const openai = monitor.openai(new OpenAI());

// 1. Create embeddings for user query
const embeddingResponse = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: userMessage,
});
const queryEmbedding = embeddingResponse.data[0].embedding;

// 2. Query your vector database (Pinecone, etc.)
const results = await pineconeIndex.query({
  vector: queryEmbedding,
  topK: 20,
  includeMetadata: true,
});

// 3. Stream the completion
const completionStream = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: prompt },
  ],
  stream: true,
});

// All requests above are automatically tracked!
for await (const chunk of completionStream) {
  const token = chunk.choices?.[0]?.delta?.content || "";
  await stream.write(token);
}
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

## 🔄 Resilient & Non-Blocking

**Critical:** The SDK is designed to **NEVER** block your LLM requests, even if LLMonitor is down.

### ✅ What this means:

- **Fire-and-forget logging** - Events are queued and sent in background
- **5-second timeouts** - Network calls to LLMonitor timeout quickly
- **Graceful degradation** - If monitoring fails, your app continues normally
- **Stream-safe** - Streaming never blocks, metrics collected asynchronously

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  debug: true, // See any monitoring errors in console
});

// Even if LLMonitor is completely down, your requests work perfectly
const openai = monitor.openai(new OpenAI());

// This ALWAYS works, regardless of LLMonitor status
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
}); // ✅ Never fails due to monitoring

// Streaming also never blocks
const stream = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Stream this!" }],
  stream: true,
}); // ✅ Streams normally even if monitoring fails

// Embeddings are also fail-safe
const embeddings = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Safe embeddings",
}); // ✅ Always returns embeddings
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
