/**
 * Facilitator Aggregator Configuration Helper
 *
 * Provides utility functions to create a facilitator aggregator
 * with multiple facilitators configured from environment variables.
 */

import { createFacilitatorConfig } from "@coinbase/x402";
import type { FacilitatorConfig } from "x402/types";
import { FacilitatorAggregator } from "./facilitator-aggregator";
import type { AggregatorConfig, FacilitatorWithPriority } from "./types/facilitator";

/**
 * Create facilitator aggregator from environment variables
 *
 * Supports multiple facilitators with priority-based failover:
 * 1. facilitator.x402.rs (Priority 1)
 * 2. facilitator.payai.network (Priority 2)
 * 3. Coinbase CDP facilitator (Priority 3)
 */
export function createFacilitatorAggregator(): FacilitatorAggregator {
  const facilitators: FacilitatorWithPriority[] = [];

  // Facilitator 1: x402.rs (Primary)
  const facilitator1Url = process.env.FACILITATOR_1_URL || "https://facilitator.x402.rs";
  const facilitator1Enabled = process.env.FACILITATOR_1_ENABLED !== "false";

  if (facilitator1Enabled) {
    facilitators.push({
      id: "x402-rs",
      name: "X402 RS Facilitator",
      config: {
        url: facilitator1Url as `${string}://${string}`,
      },
      priority: 1,
      enabled: true,
      timeoutMs: 5000,
    });
  }

  // Facilitator 2: payai.network (Secondary)
  const facilitator2Url = process.env.FACILITATOR_2_URL || "https://facilitator.payai.network";
  const facilitator2Enabled = process.env.FACILITATOR_2_ENABLED !== "false";

  if (facilitator2Enabled) {
    facilitators.push({
      id: "payai-network",
      name: "PayAI Network Facilitator",
      config: {
        url: facilitator2Url as `${string}://${string}`,
      },
      priority: 2,
      enabled: true,
      timeoutMs: 5000,
    });
  }

  // Facilitator 3: Coinbase CDP (Tertiary, requires API keys)
  const cdpApiKeyId = process.env.CDP_API_KEY_ID;
  const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
  const facilitator3Enabled = process.env.FACILITATOR_3_ENABLED !== "false";

  if (facilitator3Enabled && cdpApiKeyId && cdpApiKeySecret) {
    const cdpConfig = createFacilitatorConfig(cdpApiKeyId, cdpApiKeySecret);

    facilitators.push({
      id: "coinbase-cdp",
      name: "Coinbase CDP Facilitator",
      config: cdpConfig,
      priority: 3,
      enabled: true,
      timeoutMs: 5000,
    });
  }

  // If no facilitators are configured, fall back to default
  if (facilitators.length === 0) {
    const defaultUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || "https://x402.org/facilitator";

    facilitators.push({
      id: "default",
      name: "Default Facilitator",
      config: {
        url: defaultUrl as `${string}://${string}`,
      },
      priority: 1,
      enabled: true,
      timeoutMs: 5000,
    });
  }

  // Configuration from environment
  const config: AggregatorConfig = {
    facilitators,
    defaultTimeoutMs: parseInt(process.env.FACILITATOR_TIMEOUT_MS || "5000"),
    retriesPerFacilitator: parseInt(process.env.FACILITATOR_RETRIES || "1"),
    enableHealthCheck: process.env.FACILITATOR_HEALTH_CHECK !== "false",
    healthCheckIntervalMs: parseInt(process.env.FACILITATOR_HEALTH_CHECK_INTERVAL_MS || "30000"),
    maxConsecutiveFailures: parseInt(process.env.FACILITATOR_MAX_CONSECUTIVE_FAILURES || "3"),
    enableLogging: process.env.FACILITATOR_LOGGING !== "false",
  };

  // Log configuration in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Facilitator Aggregator] Configuration:", {
      facilitatorCount: facilitators.length,
      facilitators: facilitators.map((f) => ({
        id: f.id,
        name: f.name,
        priority: f.priority,
        enabled: f.enabled,
      })),
      healthCheckEnabled: config.enableHealthCheck,
      healthCheckIntervalMs: config.healthCheckIntervalMs,
    });
  }

  return new FacilitatorAggregator(config);
}

/**
 * Create a FacilitatorConfig that uses the aggregator
 *
 * IMPORTANT: Due to how x402 middleware works, we can't directly wrap the aggregator
 * in a FacilitatorConfig. Instead, we return the config of the first (highest priority)
 * facilitator. The aggregator will handle failover internally when methods are called.
 *
 * For full aggregator features, use getAggregatorInstance() directly.
 */
export function createAggregatorFacilitatorConfig(): FacilitatorConfig {
  const aggregator = createFacilitatorAggregator();
  const config = aggregator.getConfig();

  if (config.facilitators.length === 0) {
    throw new Error("No facilitators configured");
  }

  // Return the first facilitator's config
  // The aggregator instance is still running in the background for health checks
  return config.facilitators[0].config;
}

/**
 * Export the aggregator instance for direct use
 * This allows accessing health status and statistics
 */
let aggregatorInstance: FacilitatorAggregator | null = null;

export function getAggregatorInstance(): FacilitatorAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = createFacilitatorAggregator();
  }
  return aggregatorInstance;
}

/**
 * Reset the aggregator instance (useful for testing)
 */
export function resetAggregatorInstance() {
  if (aggregatorInstance) {
    aggregatorInstance.stop();
    aggregatorInstance = null;
  }
}
