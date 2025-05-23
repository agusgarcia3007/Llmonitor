import { LLMonitor } from "./dist/index.mjs";
import OpenAI from "openai";

async function testSDK() {
  // Initialize LLMonitor
  const monitor = new LLMonitor({
    apiKey: "test-api-key",
    debug: true,
    sessionId: "test-session-123",
    versionTag: "v1.0.0",
  });

  // Wrap OpenAI client
  const openai = monitor.openai(
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "sk-test...",
    })
  );

  try {
    console.log("🚀 Testing LLMonitor SDK...\n");

    // Make a test call
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello in Spanish" }],
      temperature: 0.7,
      max_tokens: 50,
    });

    console.log("✅ OpenAI Response:", response.choices[0].message.content);
    console.log("\n🔄 Flushing events to LLMonitor...");

    // Ensure all events are sent
    await monitor.flush();

    console.log("✅ All events sent to LLMonitor!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSDK();
}
