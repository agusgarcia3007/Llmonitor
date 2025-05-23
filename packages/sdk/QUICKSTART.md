# 🚀 LLMonitor SDK - Quick Start

Get up and running with LLMonitor in **under 2 minutes**.

## Step 1: Install

```bash
npm install @llmonitor/sdk
```

## Step 2: Get Your API Key

1. Sign up at [LLMonitor Dashboard](https://app.llmonitor.com)
2. Create an organization
3. Copy your API key from Settings

## Step 3: Wrap Your LLM Client

### OpenAI Example

```typescript
import { LLMonitor } from "@llmonitor/sdk";
import OpenAI from "openai";

// Initialize monitor
const monitor = new LLMonitor({
  apiKey: "llm_your_api_key_here",
});

// Wrap your OpenAI client
const openai = monitor.openai(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Use normally - automatically tracked!
async function chatExample() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "Explain React hooks in simple terms" },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  console.log(response.choices[0].message.content);

  // Ensure events are sent
  await monitor.flush();
}

chatExample();
```

## Step 4: Check Your Dashboard

1. Run your code
2. Visit [LLMonitor Dashboard](https://app.llmonitor.com)
3. See your requests, costs, and metrics! 🎉

## What You'll See

- ✅ **Request logs** with full details
- ✅ **Token usage** and costs
- ✅ **Latency metrics**
- ✅ **Success/error rates**
- ✅ **Cost analytics** and trends

## Next Steps

### Group Requests by Session

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_your_api_key_here",
  sessionId: "user-conversation-123", // Group related requests
});
```

### Track Different Versions

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_your_api_key_here",
  versionTag: "prompt-v2.1", // Track A/B tests
});
```

### Add Custom Metadata

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_your_api_key_here",
  metadata: {
    userId: "user-123",
    feature: "chat-assistant",
    environment: "production",
  },
});
```

### Express.js Integration

```typescript
import express from "express";
import { LLMonitor } from "@llmonitor/sdk";

const app = express();
const monitor = new LLMonitor({ apiKey: "llm_..." });

// Add middleware for automatic tracking
app.use(
  monitor.express({
    sessionId: (req) => req.user?.id,
    metadata: (req) => ({
      route: req.route?.path,
      userAgent: req.get("User-Agent"),
    }),
  })
);

// All LLM calls in your routes are now tracked
app.post("/chat", async (req, res) => {
  const openai = monitor.openai(new OpenAI());
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: req.body.messages,
  });
  res.json(response);
});
```

## 🔧 Troubleshooting

### Enable Debug Mode

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  debug: true, // See what's happening
});
```

### Check Network Connection

Make sure your server can reach your LLMonitor instance:

```typescript
const monitor = new LLMonitor({
  apiKey: "llm_...",
  baseURL: "http://localhost:4444", // For local development
  debug: true,
});
```

### Test Connection

```typescript
// Manual test event
await monitor.logEvent({
  provider: "test",
  model: "test-model",
  prompt: "Hello",
  completion: "Hi!",
  status: 200,
  latency_ms: 100,
});

console.log("Test event sent!");
```

## 📚 More Examples

- [Anthropic Claude](/examples/anthropic.md)
- [Google Gemini](/examples/google.md)
- [Cohere](/examples/cohere.md)
- [Next.js Integration](/examples/nextjs.md)
- [Error Handling](/examples/error-handling.md)

## 🤝 Need Help?

- 📖 [Full Documentation](https://docs.llmonitor.com)
- 💬 [Discord Community](https://discord.gg/llmonitor)
- 🐛 [GitHub Issues](https://github.com/llmonitor/llmonitor/issues)
- 📧 [Email Support](mailto:support@llmonitor.com)

Happy monitoring! 🚀
