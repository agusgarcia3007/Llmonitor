# LLMonitor

LLMonitor is an AI observability platform that provides deep insights into your LLM (Large Language Model) interactions. Monitor, optimize, and debug your AI applications with precision—across all major providers.

## Features

- Centralized dashboard for prompt and completion analytics
- Cost and performance tracking
- Multi-provider and multi-model support
- Alerts, drift detection, and A/B testing
- Developer-friendly integration

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run the development server

```bash
pnpm dev
```

The client will be available at `http://localhost:5173` by default.

### 3. Change language

You can switch between English and Spanish using the language switcher in the top right corner of the web app. To add or edit translations, modify the files in `apps/client/src/locale/en.json` and `apps/client/src/locale/es.json`.

## Project Structure

- `apps/client/` — Frontend (React, Vite)
- `apps/server/` — Backend/API
- `apps/client/src/locale/` — Translation files

## License

MIT
