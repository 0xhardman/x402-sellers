/**
 * Facilitator Aggregator
 *
 * Implements a priority-based failover system for X402 facilitators.
 * Automatically switches between facilitators when one fails.
 */

/**
 * NOTE: Due to module resolution issues with x402 package in Next.js,
 * the aggregator is currently disabled for actual request handling.
 *
 * This file serves as a placeholder for future implementation.
 * For now, use the simple facilitator config in middleware.
 */

import type {
  AggregatorConfig,
  FacilitatorWithPriority,
  FacilitatorHealth,
  FacilitatorStats,
  FacilitatorLogEntry,
} from "./types/facilitator";

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  defaultTimeoutMs: 5000,
  retriesPerFacilitator: 1,
  enableHealthCheck: true,
  healthCheckIntervalMs: 30000,
  maxConsecutiveFailures: 3,
  enableLogging: true,
};

/**
 * FacilitatorAggregator class (Monitoring Only)
 *
 * IMPORTANT: This is currently a placeholder for monitoring only.
 * Due to Next.js Edge Runtime limitations, actual facilitator failover
 * is not implemented. Use this for configuration and monitoring.
 */
export class FacilitatorAggregator {
  private facilitators: FacilitatorWithPriority[];
  private config: Required<AggregatorConfig>;
  private mockHealth: Map<string, FacilitatorHealth> = new Map();
  private mockStats: Map<string, FacilitatorStats> = new Map();
  private mockLogs: FacilitatorLogEntry[] = [];

  constructor(config: AggregatorConfig) {
    // Validate configuration
    if (!config.facilitators || config.facilitators.length === 0) {
      throw new Error("At least one facilitator must be configured");
    }

    // Merge with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<AggregatorConfig>;

    // Sort facilitators by priority (lower number = higher priority)
    this.facilitators = [...config.facilitators].sort(
      (a, b) => a.priority - b.priority
    );

    // Initialize mock health status
    for (const facilitator of this.facilitators) {
      this.mockHealth.set(facilitator.id, {
        id: facilitator.id,
        isHealthy: true,
        consecutiveFailures: 0,
        totalSuccesses: 0,
        totalFailures: 0,
      });

      this.mockStats.set(facilitator.id, {
        id: facilitator.id,
        verifyCount: 0,
        settleCount: 0,
        supportedCount: 0,
        listCount: 0,
        successCount: 0,
        failureCount: 0,
        averageResponseTimeMs: 0,
      });
    }

    console.log(
      `[Facilitator Aggregator] Initialized with ${this.facilitators.length} facilitators (monitoring only)`
    );
  }

  /**
   * Get health status of all facilitators
   */
  getHealthStatus() {
    return this.mockHealth;
  }

  /**
   * Get statistics for all facilitators
   */
  getStatistics() {
    return Array.from(this.mockStats.values());
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(limit: number = 100) {
    return this.mockLogs.slice(-limit);
  }

  /**
   * Manually trigger a health check for all facilitators
   */
  async checkHealth() {
    console.log("[Facilitator Aggregator] Health check not implemented (monitoring only mode)");
    return this.mockHealth;
  }

  /**
   * Stop the aggregator (stops health checking)
   */
  stop() {
    console.log("[Facilitator Aggregator] Stop called (no-op in monitoring only mode)");
  }

  /**
   * Enable or disable a facilitator
   */
  setFacilitatorEnabled(facilitatorId: string, enabled: boolean) {
    const facilitator = this.facilitators.find((f) => f.id === facilitatorId);
    if (facilitator) {
      facilitator.enabled = enabled;
    }
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      facilitators: this.facilitators,
      config: this.config,
    };
  }
}
