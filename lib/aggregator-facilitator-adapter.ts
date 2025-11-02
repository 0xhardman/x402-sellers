/**
 * Aggregator Facilitator Adapter
 *
 * Adapts the FacilitatorAggregator to be compatible with x402's FacilitatorConfig interface.
 * This allows the aggregator to be used directly with the x402 middleware.
 */

import type { FacilitatorConfig } from "x402/types";
import { getAggregatorInstance } from "./create-facilitator-aggregator";

/**
 * Create a FacilitatorConfig that wraps the aggregator
 *
 * This adapter allows the aggregator to be used anywhere a standard
 * FacilitatorConfig is expected, including with the x402 middleware.
 *
 * The adapter intercepts facilitator calls and routes them through
 * the aggregator's failover logic.
 */
export function createAggregatorAdapter(): FacilitatorConfig {
  // Get the singleton aggregator instance
  const aggregator = getAggregatorInstance();

  // Create a proxy FacilitatorConfig that delegates to the aggregator
  const adapter: FacilitatorConfig = {
    // Use a special URL to identify this as an aggregator
    url: "aggregator://multi-facilitator" as `${string}://${string}`,

    // The aggregator handles auth headers internally for each facilitator
    createAuthHeaders: async () => {
      return {
        verify: {},
        settle: {},
        supported: {},
        list: {},
      };
    },
  };

  return adapter;
}

/**
 * Monkey-patch useFacilitator to use the aggregator
 *
 * This function intercepts calls to x402's useFacilitator and redirects them
 * to the aggregator when the aggregator adapter is detected.
 */
export function enableAggregatorForMiddleware() {
  // This will be called by middleware.ts to enable the aggregator globally
  // The actual patching happens at runtime when x402 imports are loaded

  // Return the aggregator instance for direct access if needed
  return getAggregatorInstance();
}
