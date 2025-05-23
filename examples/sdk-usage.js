// Example: Using LLMonitor SDK with OpenAI
// Run with: node examples/sdk-usage.js

const OpenAI = require("openai");
const { LLMonitor } = require("@llmonitor/sdk");

async function main() {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: "sk-your-openai-api-key-here", // Replace with your actual API key
  });

  // Initialize LLMonitor
  const monitor = new LLMonitor({
    apiKey: "your-llmonitor-api-key-here", // Replace with your actual API key
    baseURL: "http://localhost:3001", // Your llmonitor server URL
    debug: true, // Enable debug logging
    sessionId: "demo-session-123",
    versionTag: "v1.0.0",
    metadata: {
      user: "demo-user",
      environment: "development",
    },
  });

  // Wrap OpenAI client with monitoring
  const monitoredOpenAI = monitor.openai(openai);

  try {
    console.log("🚀 Making monitored OpenAI call...");

    // This call will be automatically logged to LLMonitor
    const response = await monitoredOpenAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that explains technical concepts clearly.",
        },
        {
          role: "user",
          content:
            "What are the main benefits of using LLM observability tools?",
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log("✅ Response received:");
    console.log(response.choices[0].message.content);

    console.log("\n📊 Usage stats:");
    console.log(`Prompt tokens: ${response.usage.prompt_tokens}`);
    console.log(`Completion tokens: ${response.usage.completion_tokens}`);
    console.log(`Total tokens: ${response.usage.total_tokens}`);

    // Example with custom options per call
    console.log("\n🔄 Making another call with custom options...");

    const response2 = await monitoredOpenAI.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Explain TypeScript benefits in 50 words.",
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        // Override session and add custom metadata for this specific call
        sessionId: "special-session",
        versionTag: "v2.0.0-beta",
        requestId: "req-456",
        metadata: {
          feature: "typescript-explanation",
          priority: "high",
        },
      }
    );

    console.log("✅ Second response:");
    console.log(response2.choices[0].message.content);

    // Example: Manual event logging for other providers
    console.log("\n📝 Logging a manual event for Anthropic...");

    await monitor.logEvent({
      provider: "anthropic",
      model: "claude-3-sonnet-20240229",
      prompt: "Hello Claude!",
      completion: "Hello! How can I help you today?",
      status: 200,
      latency_ms: 1250,
      prompt_tokens: 10,
      completion_tokens: 12,
      cost_usd: 0.0025,
      session_id: "claude-session",
      metadata: {
        temperature: 0.7,
        custom_field: "manual-log-example",
      },
    });

    // Ensure all events are sent before exiting
    await monitor.flush();
    console.log("\n🎉 All events sent to LLMonitor successfully!");
  } catch (error) {
    console.error("❌ Error occurred:", error.message);

    // Events are still logged even if errors occur
    await monitor.flush();
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
