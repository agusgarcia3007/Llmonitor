export interface ProviderPricing {
  inputTokens: number;
  outputTokens: number;
}

export const PROVIDER_PRICING: Record<
  string,
  Record<string, ProviderPricing>
> = {
  openai: {
    "gpt-4o": { inputTokens: 2.5e-6, outputTokens: 10e-6 },
    "gpt-4o-mini": { inputTokens: 0.15e-6, outputTokens: 0.6e-6 },
    "gpt-4-turbo": { inputTokens: 10e-6, outputTokens: 30e-6 },
    "gpt-4": { inputTokens: 30e-6, outputTokens: 60e-6 },
    "gpt-3.5-turbo": { inputTokens: 0.5e-6, outputTokens: 1.5e-6 },
  },
  anthropic: {
    "claude-3-5-sonnet-20241022": { inputTokens: 3e-6, outputTokens: 15e-6 },
    "claude-3-5-sonnet-20240620": { inputTokens: 3e-6, outputTokens: 15e-6 },
    "claude-3-opus-20240229": { inputTokens: 15e-6, outputTokens: 75e-6 },
    "claude-3-sonnet-20240229": { inputTokens: 3e-6, outputTokens: 15e-6 },
    "claude-3-haiku-20240307": { inputTokens: 0.25e-6, outputTokens: 1.25e-6 },
  },
  google: {
    "gemini-1.5-pro": { inputTokens: 1.25e-6, outputTokens: 5e-6 },
    "gemini-1.5-flash": { inputTokens: 0.075e-6, outputTokens: 0.3e-6 },
    "gemini-1.0-pro": { inputTokens: 0.5e-6, outputTokens: 1.5e-6 },
  },
  cohere: {
    "command-r-plus": { inputTokens: 3e-6, outputTokens: 15e-6 },
    "command-r": { inputTokens: 0.5e-6, outputTokens: 1.5e-6 },
    command: { inputTokens: 1e-6, outputTokens: 2e-6 },
  },
  mistral: {
    "mistral-large-latest": { inputTokens: 2e-6, outputTokens: 6e-6 },
    "mistral-medium-latest": { inputTokens: 2.7e-6, outputTokens: 8.1e-6 },
    "mistral-small-latest": { inputTokens: 1e-6, outputTokens: 3e-6 },
  },
  deepseek: {
    "deepseek-chat": { inputTokens: 0.07e-3, outputTokens: 1.1e-3 },
    "deepseek-reasoner": { inputTokens: 0.14e-3, outputTokens: 2.19e-3 },
  },
};

export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const providerPricing = PROVIDER_PRICING[provider?.toLowerCase()];
  if (!providerPricing) {
    return 0;
  }

  const modelPricing = providerPricing[model];
  if (!modelPricing) {
    return 0;
  }

  const inputCost = promptTokens * modelPricing.inputTokens;
  const outputCost = completionTokens * modelPricing.outputTokens;

  return inputCost + outputCost;
}

export function getAllProviders(): string[] {
  return Object.keys(PROVIDER_PRICING);
}

export function getProviderModels(provider: string): string[] {
  const providerPricing = PROVIDER_PRICING[provider?.toLowerCase()];
  return providerPricing ? Object.keys(providerPricing) : [];
}
