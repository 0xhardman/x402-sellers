/**
 * Facilitator Health Checker
 *
 * Monitors the health of facilitators by periodically checking their availability
 * and tracking success/failure rates.
 */

import { useFacilitator } from "x402";
import type {
  FacilitatorWithPriority,
  FacilitatorHealth,
} from "./types/facilitator";

interface HealthCheckConfig {
  /** Interval between health checks in milliseconds */
  checkIntervalMs: number;

  /** Maximum consecutive failures before marking as unhealthy */
  maxConsecutiveFailures: number;

  /** Whether health checking is enabled */
  enabled: boolean;
}

/**
 * FacilitatorHealthChecker class
 *
 * Performs background health checks on facilitators and tracks their health status
 */
export class FacilitatorHealthChecker {
  private facilitators: FacilitatorWithPriority[];
  private healthMap: Map<string, FacilitatorHealth> = new Map();
  private config: HealthCheckConfig;
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(facilitators: FacilitatorWithPriority[], config: HealthCheckConfig) {
    this.facilitators = facilitators;
    this.config = config;

    // Initialize health status for all facilitators
    for (const facilitator of facilitators) {
      this.healthMap.set(facilitator.id, {
        id: facilitator.id,
        isHealthy: true, // Assume healthy initially
        consecutiveFailures: 0,
        totalSuccesses: 0,
        totalFailures: 0,
      });
    }
  }

  /**
   * Start periodic health checking
   */
  start() {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    this.isRunning = true;

    // Perform initial check immediately
    this.checkAll().catch((error) => {
      console.error("[Health Checker] Initial health check failed:", error);
    });

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.checkAll().catch((error) => {
        console.error("[Health Checker] Periodic health check failed:", error);
      });
    }, this.config.checkIntervalMs);

    console.log(
      `[Health Checker] Started with interval: ${this.config.checkIntervalMs}ms`
    );
  }

  /**
   * Stop periodic health checking
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log("[Health Checker] Stopped");
  }

  /**
   * Check health of all facilitators
   */
  async checkAll(): Promise<Map<string, FacilitatorHealth>> {
    const checkPromises = this.facilitators.map((facilitator) =>
      this.checkOne(facilitator)
    );

    await Promise.allSettled(checkPromises);

    return this.healthMap;
  }

  /**
   * Check health of a single facilitator
   */
  async checkOne(facilitator: FacilitatorWithPriority): Promise<void> {
    if (!facilitator.enabled) {
      return;
    }

    const startTime = Date.now();

    try {
      // Use the /supported endpoint as a health check
      const client = useFacilitator(facilitator.config);

      // Set a timeout for the health check (shorter than regular operations)
      const timeoutMs = 3000; // 3 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Health check timeout")), timeoutMs);
      });

      await Promise.race([client.supported(), timeoutPromise]);

      const responseTimeMs = Date.now() - startTime;

      // Health check succeeded
      this.recordSuccess(facilitator.id, responseTimeMs);
    } catch (error) {
      // Health check failed
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.recordFailure(facilitator.id, errorMessage);
    }
  }

  /**
   * Record a successful operation for a facilitator
   */
  recordSuccess(facilitatorId: string, responseTimeMs: number) {
    const health = this.healthMap.get(facilitatorId);
    if (!health) {
      return;
    }

    health.isHealthy = true;
    health.consecutiveFailures = 0;
    health.totalSuccesses++;
    health.lastSuccessfulCheck = new Date();

    // Update average response time (rolling average)
    if (health.averageResponseTimeMs === undefined) {
      health.averageResponseTimeMs = responseTimeMs;
    } else {
      // Exponential moving average with weight 0.3 for new value
      health.averageResponseTimeMs =
        health.averageResponseTimeMs * 0.7 + responseTimeMs * 0.3;
    }

    // Clear last error
    health.lastError = undefined;

    this.healthMap.set(facilitatorId, health);
  }

  /**
   * Record a failed operation for a facilitator
   */
  recordFailure(facilitatorId: string, errorMessage: string) {
    const health = this.healthMap.get(facilitatorId);
    if (!health) {
      return;
    }

    health.consecutiveFailures++;
    health.totalFailures++;
    health.lastFailedCheck = new Date();
    health.lastError = errorMessage;

    // Mark as unhealthy if too many consecutive failures
    if (health.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      health.isHealthy = false;

      console.warn(
        `[Health Checker] Facilitator '${facilitatorId}' marked as unhealthy after ${health.consecutiveFailures} consecutive failures. Last error: ${errorMessage}`
      );
    }

    this.healthMap.set(facilitatorId, health);
  }

  /**
   * Get health status for a specific facilitator
   */
  getHealth(facilitatorId: string): FacilitatorHealth | undefined {
    return this.healthMap.get(facilitatorId);
  }

  /**
   * Get health status for all facilitators
   */
  getAllHealth(): Map<string, FacilitatorHealth> {
    return new Map(this.healthMap);
  }

  /**
   * Get health statistics summary
   */
  getHealthSummary() {
    const facilitators = Array.from(this.healthMap.values());

    return {
      total: facilitators.length,
      healthy: facilitators.filter((h) => h.isHealthy).length,
      unhealthy: facilitators.filter((h) => !h.isHealthy).length,
      totalSuccesses: facilitators.reduce((sum, h) => sum + h.totalSuccesses, 0),
      totalFailures: facilitators.reduce((sum, h) => sum + h.totalFailures, 0),
      averageResponseTime:
        facilitators.reduce(
          (sum, h) => sum + (h.averageResponseTimeMs || 0),
          0
        ) / facilitators.length,
    };
  }

  /**
   * Manually mark a facilitator as healthy or unhealthy
   */
  setHealthStatus(facilitatorId: string, isHealthy: boolean) {
    const health = this.healthMap.get(facilitatorId);
    if (!health) {
      return;
    }

    health.isHealthy = isHealthy;

    if (isHealthy) {
      health.consecutiveFailures = 0;
    }

    this.healthMap.set(facilitatorId, health);
  }

  /**
   * Reset health statistics for a facilitator
   */
  resetStats(facilitatorId: string) {
    const health = this.healthMap.get(facilitatorId);
    if (!health) {
      return;
    }

    health.consecutiveFailures = 0;
    health.totalSuccesses = 0;
    health.totalFailures = 0;
    health.isHealthy = true;
    health.lastError = undefined;

    this.healthMap.set(facilitatorId, health);
  }

  /**
   * Reset all health statistics
   */
  resetAllStats() {
    for (const facilitatorId of this.healthMap.keys()) {
      this.resetStats(facilitatorId);
    }
  }

  /**
   * Check if any facilitator is healthy
   */
  hasHealthyFacilitator(): boolean {
    return Array.from(this.healthMap.values()).some((h) => h.isHealthy);
  }

  /**
   * Get the healthiest facilitator (by response time)
   */
  getHealthiestFacilitator(): string | null {
    const healthyFacilitators = Array.from(this.healthMap.values()).filter(
      (h) => h.isHealthy && h.averageResponseTimeMs !== undefined
    );

    if (healthyFacilitators.length === 0) {
      return null;
    }

    const healthiest = healthyFacilitators.reduce((best, current) =>
      (current.averageResponseTimeMs || Infinity) <
      (best.averageResponseTimeMs || Infinity)
        ? current
        : best
    );

    return healthiest.id;
  }
}
