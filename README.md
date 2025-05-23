# LLMonitor

**Model-agnostic LLM Observability & Cost Intelligence**

LLMonitor gives AI builders a **single pane of glass** to see **how every prompt behaves, how much it costs, and when it breaks**—across any model provider (OpenAI, Anthropic, Google, etc.).

Replace home-grown logs, scattered dashboards and blind-spot debugging with an **actionable, dev-friendly analytics layer** that pays for itself by cutting token spend and downtime.

## 🚀 Features

- **📊 Centralized Dashboard** - Prompt and completion analytics across all providers
- **💰 Cost Intelligence** - Real-time spend tracking with automated cost calculation
- **⚡ Performance Monitoring** - Latency, token usage, and success rates
- **🔍 Multi-provider Support** - OpenAI, Anthropic, Google, Cohere, and custom providers
- **🚨 Drift Detection** - Get alerted when performance or costs break thresholds
- **🧪 A/B Testing** - Compare prompt variants with version tagging
- **🛠️ Developer-friendly** - One-line SDK integration with TypeScript support

## 📦 Packages

This monorepo contains:

- **`apps/client/`** — Frontend dashboard (React, Vite, TanStack Router)
- **`apps/server/`** — Backend API (Bun, Hono, Drizzle, PostgreSQL)
- **`apps/docs/`** — Documentation site (Fumadocs, TanStack Start)
- **`packages/sdk/`** — Official JavaScript/TypeScript SDK for easy integration

## 🏃‍♂️ Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

```bash
cd apps/server
pnpm db:push  # Set up database schema
```

### 3. Run the development server

```bash
pnpm dev
```

This will start:

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`
- Docs: `http://localhost:3000` (run separately: `cd apps/docs && pnpm dev`)

### 4. Integrate with your app

Install the SDK in your project:

```bash
npm install @llmonitor/sdk
```

Wrap your OpenAI client:

```typescript
import OpenAI from "openai";
import { LLMonitor } from "@llmonitor/sdk";

const openai = new OpenAI({ apiKey: "your-key" });
const monitor = new LLMonitor({ apiKey: "your-llmonitor-key" });
const monitoredOpenAI = monitor.openai(openai);

// Use exactly like normal OpenAI client - automatically logged!
const response = await monitoredOpenAI.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

## 🗂️ Project Structure

```
llmonitor/
├── apps/
│   ├── client/           # React dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── locale/   # i18n translations (en, es)
│   │   └── package.json
│   ├── server/           # Hono API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── db/schema/
│   │   │   └── middleware/
│   │   └── package.json
│   └── docs/             # Fumadocs documentation site
│       ├── content/
│       │   └── docs/     # MDX documentation files
│       ├── app/
│       └── package.json
├── packages/
│   └── sdk/              # Official JavaScript SDK
│       ├── src/
│       │   ├── providers/
│       │   └── types.ts
│       └── package.json
├── examples/
│   └── sdk-usage.js      # SDK integration examples
└── PRD.md                # Product Requirements Document
```

## 🌐 Language Support

Switch between English and Spanish using the language switcher in the dashboard. To add or edit translations, modify:

- `apps/client/src/locale/en.json`
- `apps/client/src/locale/es.json`

## 📖 Documentation

- **[📚 Full Documentation](http://localhost:3000)** - Complete docs site with examples
- **[Product Requirements](./PRD.md)** - Detailed feature specs and roadmap
- **[SDK Documentation](./packages/sdk/README.md)** - Integration guide and API reference
- **[Examples](./examples/)** - Working code examples

## 🧑‍💻 Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm

### Environment Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example` in each app)
4. Start development: `pnpm dev`

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @llmonitor/sdk build
pnpm --filter client build
pnpm --filter server build
pnpm --filter docs build
```

### Development Servers

```bash
# All services (client + server)
pnpm dev

# Individual services
cd apps/client && pnpm dev    # Dashboard at :5173
cd apps/server && pnpm dev    # API at :3001
cd apps/docs && pnpm dev      # Docs at :3000
cd packages/sdk && pnpm dev   # SDK watch mode
```

## 📄 License

MIT - see [LICENSE](./LICENSE) for details.

---

Built with ❤️ for the AI community
