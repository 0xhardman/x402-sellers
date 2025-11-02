/**
 * Payment Middleware with Failover
 *
 * Wraps x402-next's paymentMiddleware to provide automatic failover
 * between multiple facilitators. Works in Edge Runtime!
 */

import { paymentMiddleware } from "x402-next";
import { createFacilitatorConfig } from "@coinbase/x402";
import type { FacilitatorConfig } from "x402/types";
import type { NextRequest } from "next/server";

interface FacilitatorOption {
  id: string;
  name: string;
  config: FacilitatorConfig;
  priority: number;
  timeoutMs?: number;  // Timeout for this specific facilitator
}

// Default timeout for facilitator requests (5 seconds)
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Create payment middleware with automatic failover between facilitators
 *
 * @param wallet - Wallet address to receive payments
 * @param routes - Route configuration for payment middleware
 * @param facilitators - Array of facilitator options (sorted by priority)
 * @returns Middleware function with failover support
 */
export function createPaymentMiddlewareWithFailover(
  wallet: `0x${string}`,
  routes: Parameters<typeof paymentMiddleware>[1],
  facilitators: FacilitatorOption[]
) {
  // Sort facilitators by priority (lower number = higher priority)
  const sortedFacilitators = [...facilitators].sort(
    (a, b) => a.priority - b.priority
  );

  // Create a middleware instance for each facilitator
  const middlewareInstances = sortedFacilitators.map((facilitator) => ({
    ...facilitator,
    middleware: paymentMiddleware(wallet, routes, facilitator.config),
  }));

  console.log(
    `[Failover Middleware] Initialized with ${middlewareInstances.length} facilitators:`,
    middlewareInstances.map((f) => `${f.name} (priority ${f.priority})`).join(", ")
  );

  // Return wrapped middleware with failover logic
  return async (request: NextRequest, event: any) => {
    const startTime = Date.now();
    const errors: Array<{ facilitator: string; error: string }> = [];

    // Try each facilitator in priority order
    for (let i = 0; i < middlewareInstances.length; i++) {
      const { id, name, middleware, timeoutMs } = middlewareInstances[i];
      const timeout = timeoutMs || DEFAULT_TIMEOUT_MS;

      try {
        console.log(`[Failover Middleware] Trying facilitator: ${name} (timeout: ${timeout}ms)`);

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Timeout after ${timeout}ms`));
          }, timeout);
        });

        // Race between middleware call and timeout
        const response = await Promise.race([
          middleware(request, event),
          timeoutPromise,
        ]);

        // Check if response indicates failure
        // We consider 5xx errors as facilitator failures that should trigger failover
        if (response.status >= 500) {
          const errorMsg = `HTTP ${response.status}`;
          errors.push({ facilitator: name, error: errorMsg });

          console.warn(
            `[Failover Middleware] ${name} returned ${response.status}, trying next facilitator...`
          );

          // If this is not the last facilitator, continue to next
          if (i < middlewareInstances.length - 1) {
            continue;
          }

          // If this is the last facilitator, return the error response
          return response;
        }

        // Success! Log and return
        const duration = Date.now() - startTime;
        console.log(
          `[Failover Middleware] ✓ Success with ${name} (${duration}ms)` +
            (i > 0 ? ` after ${i} failover(s)` : "")
        );

        return response;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        errors.push({ facilitator: name, error: errorMsg });

        console.error(
          `[Failover Middleware] ✗ ${name} failed:`,
          errorMsg
        );

        // If this is the last facilitator, throw the error
        if (i === middlewareInstances.length - 1) {
          throw error;
        }

        // Otherwise, continue to next facilitator
        console.log(
          `[Failover Middleware] Attempting next facilitator (${
            middlewareInstances.length - i - 1
          } remaining)...`
        );
      }
    }

    // This should never be reached, but just in case
    const duration = Date.now() - startTime;
    console.error(
      `[Failover Middleware] All facilitators failed after ${duration}ms:`,
      errors
    );

    return new Response(
      JSON.stringify({
        error: "All payment facilitators are currently unavailable",
        details: errors,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  };
}

/**
 * Helper function to create facilitator options from environment variables
 */
export function getFacilitatorsFromEnv(): FacilitatorOption[] {
  const facilitators: FacilitatorOption[] = [];

  // Get global timeout setting (default 5000ms)
  const defaultTimeout = parseInt(process.env.FACILITATOR_TIMEOUT_MS || "5000");

  // Facilitator 1: x402.rs
  const facilitator1Url = process.env.FACILITATOR_1_URL || "https://facilitator.x402.rs";
  const facilitator1Enabled = process.env.FACILITATOR_1_ENABLED !== "false";
  const facilitator1Timeout = parseInt(process.env.FACILITATOR_1_TIMEOUT_MS || String(defaultTimeout));

  if (facilitator1Enabled) {
    facilitators.push({
      id: "x402-rs",
      name: "X402 RS",
      config: {
        url: facilitator1Url as `${string}://${string}`,
      },
      priority: 1,
      timeoutMs: facilitator1Timeout,
    });
  }

  // Facilitator 2: payai.network
  const facilitator2Url = process.env.FACILITATOR_2_URL || "https://facilitator.payai.network";
  const facilitator2Enabled = process.env.FACILITATOR_2_ENABLED !== "false";
  const facilitator2Timeout = parseInt(process.env.FACILITATOR_2_TIMEOUT_MS || String(defaultTimeout));

  if (facilitator2Enabled) {
    facilitators.push({
      id: "payai-network",
      name: "PayAI Network",
      config: {
        url: facilitator2Url as `${string}://${string}`,
      },
      priority: 2,
      timeoutMs: facilitator2Timeout,
    });
  }

  // Facilitator 3: Coinbase CDP (requires API keys)
  const cdpApiKeyId = process.env.CDP_API_KEY_ID;
  const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
  const facilitator3Enabled = process.env.FACILITATOR_3_ENABLED !== "false";
  const facilitator3Timeout = parseInt(process.env.FACILITATOR_3_TIMEOUT_MS || String(defaultTimeout));

  if (facilitator3Enabled && cdpApiKeyId && cdpApiKeySecret) {
    facilitators.push({
      id: "coinbase-cdp",
      name: "Coinbase CDP",
      config: createFacilitatorConfig(cdpApiKeyId, cdpApiKeySecret),
      priority: 3,
      timeoutMs: facilitator3Timeout,
    });
  }

  // If no facilitators configured, use default
  if (facilitators.length === 0) {
    const defaultUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL || "https://x402.org/facilitator";
    facilitators.push({
      id: "default",
      name: "Default",
      config: {
        url: defaultUrl as `${string}://${string}`,
      },
      priority: 1,
      timeoutMs: defaultTimeout,
    });
  }

  return facilitators;
}
