/**
 * Facilitator Configuration
 *
 * Configure payment facilitators here. Add, remove, or modify facilitators as needed.
 *
 * - For URL-based facilitators: Just provide id, name, url, priority, and timeoutMs
 * - For Coinbase CDP: Set type to "coinbase-cdp" and provide apiKeyId/apiKeySecret from env
 */

import type { FacilitatorConfig } from "./lib/types";

export const facilitators: FacilitatorConfig[] = [
  // Primary: X402 RS
  {
    id: "x402-rs",
    name: "X402 RS",
    url: "https://facilitator.x402.rs",
    priority: 1,
    timeoutMs: 5000,
  },

  // Secondary: PayAI Network
  {
    id: "payai-network",
    name: "PayAI Network",
    url: "https://facilitator.payai.network",
    priority: 2,
    timeoutMs: 5000,
  },

  // Tertiary: Coinbase CDP (requires API keys in .env)
  {
    id: "coinbase-cdp",
    name: "Coinbase CDP",
    type: "coinbase-cdp",
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    priority: 3,
    timeoutMs: 10000,
  },
];

// Filter out facilitators that don't have required credentials
export const enabledFacilitators = facilitators.filter((f) => {
  if (f.type === "coinbase-cdp") {
    // Coinbase CDP requires both API key ID and secret
    return f.apiKeyId && f.apiKeySecret;
  }
  // URL-based facilitators just need a URL
  return Boolean(f.url);
});
