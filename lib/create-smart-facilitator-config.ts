/**
 * Smart Facilitator Config
 *
 * NOTE: Due to Edge Runtime limitations in Next.js middleware,
 * we cannot use the aggregator directly in middleware.
 *
 * Instead, this provides a simple facilitator config for middleware,
 * while the aggregator runs in the background for monitoring only.
 */

import { createFacilitatorConfig } from "@coinbase/x402";
import type { FacilitatorConfig } from "x402/types";

/**
 * Create facilitator config for use in middleware
 *
 * This returns a simple facilitator config that works in Edge Runtime.
 * The aggregator (if enabled) runs separately for monitoring purposes only.
 */
export function createSmartFacilitatorConfig(): FacilitatorConfig {
  console.log("[Smart Facilitator] Creating facilitator config for middleware");
  return createDefaultFacilitatorConfig();
}

/**
 * Create default facilitator config (Coinbase CDP or fallback)
 */
function createDefaultFacilitatorConfig(): FacilitatorConfig {
  const cdpApiKeyId = process.env.CDP_API_KEY_ID;
  const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;

  // If CDP credentials are available, use Coinbase facilitator
  if (cdpApiKeyId && cdpApiKeySecret) {
    console.log("[Smart Facilitator] Using Coinbase CDP facilitator");
    return createFacilitatorConfig(cdpApiKeyId, cdpApiKeySecret);
  }

  // Otherwise use environment variable or default
  const fallbackUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || "https://x402.org/facilitator";
  console.log(`[Smart Facilitator] Using fallback facilitator: ${fallbackUrl}`);

  return {
    url: fallbackUrl as `${string}://${string}`,
  };
}

/**
 * Check if aggregator mode is enabled
 * (Aggregator runs in Node.js runtime for monitoring, not in Edge Runtime)
 */
export function isAggregatorEnabled(): boolean {
  return process.env.ENABLE_FACILITATOR_AGGREGATOR === "true";
}
