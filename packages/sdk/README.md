# @llmonitor/sdk

Model-agnostic LLM Observability & Cost Intelligence SDK for JavaScript and TypeScript.

## Installation

```bash
npm install @llmonitor/sdk
```

## Quick Start

```typescript
import { LLMonitor } from "@llmonitor/sdk";

const monitor = new LLMonitor({
  apiKey: "your-api-key",
  sessionId: "user-session-123",
  versionTag: "v1.0.0",
});
```

## Supported Providers

### OpenAI

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: "your-openai-key" });
const monitoredOpenAI = monitor.openai(openai);

const response = await monitoredOpenAI.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Anthropic

```typescript
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: "your-anthropic-key" });
const monitoredAnthropic = monitor.anthropic(anthropic);

const response = await monitoredAnthropic.messages.create({
  model: "claude-3-sonnet-20240229",
  max_tokens: 1000,
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Google AI

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("your-google-key");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const monitoredModel = monitor.google(model, "gemini-pro");

const response = await monitoredModel.generateContent("Hello!");
```

### Cohere

```typescript
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: "your-cohere-key" });
const monitoredCohere = monitor.cohere(cohere);

const response = await monitoredCohere.generate({
  prompt: "Hello!",
  model: "command",
});
```

## Express.js Middleware

```typescript
import express from "express";

const app = express();

// Add monitoring middleware
app.use(
  monitor.express({
    skipPaths: ["/health", "/metrics"],
    extractSessionId: (req) => req.headers["x-session-id"],
  })
);
```

## Manual Event Logging

```typescript
await monitor.logEvent({
  provider: "custom",
  model: "my-model",
  prompt: "Hello!",
  completion: "Hi there!",
  status: 200,
  latency_ms: 1200,
  cost_usd: 0.002,
});
```

## Configuration

```typescript
interface LLMonitorConfig {
  apiKey: string;
  baseURL?: string; // Default: "http://localhost:3001"
  debug?: boolean; // Default: false
  enabled?: boolean; // Default: true
  sessionId?: string;
  versionTag?: string;
  metadata?: Record<string, any>;
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import {
  LLMonitor,
  LLMonitorConfig,
  LLMEvent,
  ProviderOptions,
} from "@llmonitor/sdk";
```

## Error Handling

The SDK is designed to never break your application:

- Network errors are silently caught
- Invalid configurations fall back to safe defaults
- Wrapped clients behave identically to originals

## License

MIT
