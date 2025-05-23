# @llmonitor/sdk

The official SDK for **llmonitor** - Model-agnostic LLM Observability & Cost Intelligence.

Monitor your LLM calls across any provider (OpenAI, Anthropic, Google, etc.) with one line of code.

## Installation

```bash
npm install @llmonitor/sdk
# or
yarn add @llmonitor/sdk
# or
pnpm add @llmonitor/sdk
```

## Quick Start

### 1. Initialize LLMonitor

```typescript
import { LLMonitor } from "@llmonitor/sdk";

const monitor = new LLMonitor({
  apiKey: "your-api-key", // Get this from your llmonitor dashboard
  baseURL: "https://api.llmonitor.ai", // Optional: defaults to localhost for dev
  sessionId: "user-session-123", // Optional: track user sessions
  versionTag: "v1.0.0", // Optional: tag your prompt versions
  debug: true, // Optional: enable debug logging
});
```

### 2. Wrap Your OpenAI Client

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap your OpenAI client
const monitoredOpenAI = monitor.openai(openai);

// Use exactly like the normal OpenAI client
const response = await monitoredOpenAI.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "What is the capital of France?" }],
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

### 3. Manual Event Logging

You can also manually log events for any LLM provider:

```typescript
await monitor.logEvent({
  provider: "anthropic",
  model: "claude-3-sonnet",
  prompt: "Hello Claude!",
  completion: "Hello! How can I help you today?",
  status: 200,
  latency_ms: 1200,
  prompt_tokens: 10,
  completion_tokens: 15,
  cost_usd: 0.002,
  metadata: {
    temperature: 0.7,
    custom_field: "value",
  },
});
```

## Features

### ✅ Auto-tracking

- **Latency**: Response time for every call
- **Token usage**: Input/output tokens with cost calculation
- **Success/Error rates**: Track failures and status codes
- **Model parameters**: Temperature, max_tokens, etc.

### ✅ Multi-provider support

- **OpenAI**: GPT-4, GPT-3.5, GPT-4o, etc.
- **Anthropic**: Claude-3, Claude-2 (coming soon)
- **Google**: Gemini models (coming soon)
- **Custom providers**: Manual logging for any LLM

### ✅ Cost intelligence

- Automatic cost calculation for major providers
- Track spend by model, session, version
- Identify expensive outliers

### ✅ Session tracking

- Group calls by user session
- Track conversation flows
- A/B test different prompt versions

## Advanced Usage

### Session and Version Tracking

```typescript
// Set global defaults
const monitor = new LLMonitor({
  apiKey: "your-api-key",
  sessionId: "user-123",
  versionTag: "prompt-v2.1",
});

// Override per call
const response = await monitoredOpenAI.chat.completions.create(
  {
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  },
  {
    sessionId: "different-session",
    versionTag: "experiment-a",
    requestId: "req-456",
    metadata: {
      userId: "user-789",
      feature: "chat",
    },
  }
);
```

### Error Handling

The SDK automatically captures errors and continues normal execution:

```typescript
try {
  const response = await monitoredOpenAI.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  });
} catch (error) {
  // Error is automatically logged to llmonitor
  // Your normal error handling continues
  console.error("OpenAI call failed:", error);
}
```

### Batch Operations

```typescript
// Ensure all events are sent before app shutdown
await monitor.flush();
```

### Environment Variables

You can set configuration via environment variables:

```bash
LLMONITOR_API_KEY=your-api-key
LLMONITOR_BASE_URL=https://api.llmonitor.ai
LLMONITOR_DEBUG=true
LLMONITOR_ENABLED=true
```

## Configuration Options

| Option       | Type      | Default                 | Description               |
| ------------ | --------- | ----------------------- | ------------------------- |
| `apiKey`     | `string`  | **required**            | Your LLMonitor API key    |
| `baseURL`    | `string`  | `http://localhost:3001` | LLMonitor API endpoint    |
| `debug`      | `boolean` | `false`                 | Enable debug logging      |
| `enabled`    | `boolean` | `true`                  | Enable/disable monitoring |
| `sessionId`  | `string`  | `undefined`             | Default session ID        |
| `versionTag` | `string`  | `undefined`             | Default version tag       |
| `metadata`   | `object`  | `{}`                    | Default metadata          |

## TypeScript Support

The SDK is written in TypeScript and provides full type safety:

```typescript
import { LLMonitor, LLMEvent, LLMonitorConfig } from "@llmonitor/sdk";

const config: LLMonitorConfig = {
  apiKey: "your-key",
  debug: true,
};

const event: LLMEvent = {
  provider: "openai",
  model: "gpt-4",
  prompt: "Hello",
  completion: "Hi there!",
  status: 200,
};
```

## Examples

Check out the [examples folder](./examples) for complete working examples:

- Basic OpenAI integration
- Express.js middleware
- Next.js API routes
- Custom provider implementation

## License

MIT
