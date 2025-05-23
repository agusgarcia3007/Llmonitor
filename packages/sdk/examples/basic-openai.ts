import OpenAI from "openai";
import { LLMonitor } from "@llmonitor/sdk";

const openai = new OpenAI({
  apiKey: "sk-your-openai-api-key-here",
});

const monitor = new LLMonitor({
  apiKey: "your-llmonitor-api-key-here",
  debug: true,
  sessionId: "example-session",
  versionTag: "v1.0.0",
});

const monitoredOpenAI = monitor.openai(openai);

async function main() {
  try {
    console.log("Making OpenAI call...");

    const response = await monitoredOpenAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that explains concepts clearly.",
        },
        {
          role: "user",
          content: "What is the difference between TypeScript and JavaScript?",
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log("Response:", response.choices[0].message.content);
    console.log("Usage:", response.usage);

    await monitor.flush();
    console.log("Events sent to LLMonitor!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
