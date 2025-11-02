/**
 * Facilitator Logger
 *
 * Logs facilitator operations and collects statistics for monitoring and debugging.
 */

import type {
  FacilitatorLogEntry,
  FacilitatorStats,
} from "./types/facilitator";

interface LoggerConfig {
  /** Whether logging is enabled */
  enabled: boolean;

  /** Maximum number of log entries to keep in memory */
  maxLogEntries?: number;
}

const DEFAULT_MAX_LOG_ENTRIES = 1000;

/**
 * FacilitatorLogger class
 *
 * Tracks operations, errors, and statistics for facilitators
 */
export class FacilitatorLogger {
  private config: Required<LoggerConfig>;
  private logs: FacilitatorLogEntry[] = [];
  private stats: Map<string, FacilitatorStats> = new Map();

  constructor(config: LoggerConfig) {
    this.config = {
      maxLogEntries: DEFAULT_MAX_LOG_ENTRIES,
      ...config,
    };
  }

  /**
   * Log a successful operation
   */
  logSuccess(
    operation: "verify" | "settle" | "supported" | "list" | "health-check",
    facilitatorId: string,
    facilitatorName: string,
    responseTimeMs: number,
    context?: Record<string, unknown>
  ) {
    if (!this.config.enabled) {
      return;
    }

    const entry: FacilitatorLogEntry = {
      timestamp: new Date(),
      operation,
      facilitatorId,
      facilitatorName,
      success: true,
      responseTimeMs,
      context,
    };

    this.addLogEntry(entry);
    this.updateStats(facilitatorId, operation, true, responseTimeMs);

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Facilitator] ✓ ${operation} via ${facilitatorName} (${responseTimeMs}ms)`,
        context ? context : ""
      );
    }
  }

  /**
   * Log a failed operation
   */
  logError(
    operation: "verify" | "settle" | "supported" | "list" | "health-check",
    facilitatorId: string,
    error: string,
    responseTimeMs: number,
    context?: Record<string, unknown>
  ) {
    if (!this.config.enabled) {
      return;
    }

    const entry: FacilitatorLogEntry = {
      timestamp: new Date(),
      operation,
      facilitatorId,
      facilitatorName: facilitatorId, // Use ID as name when we don't have the name
      success: false,
      responseTimeMs,
      error,
      context,
    };

    this.addLogEntry(entry);

    if (facilitatorId !== "none" && facilitatorId !== "all") {
      this.updateStats(facilitatorId, operation, false, responseTimeMs);
    }

    // Console log errors always (even in production)
    console.error(
      `[Facilitator] ✗ ${operation} failed for ${facilitatorId}: ${error} (${responseTimeMs}ms)`,
      context ? context : ""
    );
  }

  /**
   * Add a log entry (with rotation)
   */
  private addLogEntry(entry: FacilitatorLogEntry) {
    this.logs.push(entry);

    // Rotate logs if exceeding max size
    if (this.logs.length > this.config.maxLogEntries) {
      // Remove oldest 10% of logs
      const removeCount = Math.floor(this.config.maxLogEntries * 0.1);
      this.logs.splice(0, removeCount);
    }
  }

  /**
   * Update statistics for a facilitator
   */
  private updateStats(
    facilitatorId: string,
    operation: "verify" | "settle" | "supported" | "list" | "health-check",
    success: boolean,
    responseTimeMs: number
  ) {
    let stats = this.stats.get(facilitatorId);

    if (!stats) {
      stats = {
        id: facilitatorId,
        verifyCount: 0,
        settleCount: 0,
        supportedCount: 0,
        listCount: 0,
        successCount: 0,
        failureCount: 0,
        averageResponseTimeMs: 0,
      };
    }

    // Update operation counts
    switch (operation) {
      case "verify":
        stats.verifyCount++;
        break;
      case "settle":
        stats.settleCount++;
        break;
      case "supported":
        stats.supportedCount++;
        break;
      case "list":
        stats.listCount++;
        break;
      // health-check doesn't count in stats
    }

    // Update success/failure counts
    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    // Update average response time (exponential moving average)
    const totalOperations = stats.successCount + stats.failureCount;
    if (totalOperations === 1) {
      stats.averageResponseTimeMs = responseTimeMs;
    } else {
      // Weight newer values more heavily (0.3 weight for new value)
      stats.averageResponseTimeMs =
        stats.averageResponseTimeMs * 0.7 + responseTimeMs * 0.3;
    }

    stats.lastUsed = new Date();

    this.stats.set(facilitatorId, stats);
  }

  /**
   * Get statistics for a specific facilitator
   */
  getStats(facilitatorId: string): FacilitatorStats | undefined {
    return this.stats.get(facilitatorId);
  }

  /**
   * Get statistics for all facilitators
   */
  getStatistics(): FacilitatorStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get recent log entries
   */
  getRecentLogs(limit: number = 100): FacilitatorLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs for a specific facilitator
   */
  getLogsForFacilitator(
    facilitatorId: string,
    limit?: number
  ): FacilitatorLogEntry[] {
    const facilitatorLogs = this.logs.filter(
      (log) => log.facilitatorId === facilitatorId
    );

    if (limit) {
      return facilitatorLogs.slice(-limit);
    }

    return facilitatorLogs;
  }

  /**
   * Get logs for a specific operation type
   */
  getLogsForOperation(
    operation: "verify" | "settle" | "supported" | "list" | "health-check",
    limit?: number
  ): FacilitatorLogEntry[] {
    const operationLogs = this.logs.filter((log) => log.operation === operation);

    if (limit) {
      return operationLogs.slice(-limit);
    }

    return operationLogs;
  }

  /**
   * Get failed logs only
   */
  getFailedLogs(limit?: number): FacilitatorLogEntry[] {
    const failedLogs = this.logs.filter((log) => !log.success);

    if (limit) {
      return failedLogs.slice(-limit);
    }

    return failedLogs;
  }

  /**
   * Get overall statistics summary
   */
  getOverallSummary() {
    const allStats = Array.from(this.stats.values());

    const totalOperations = allStats.reduce(
      (sum, stat) =>
        sum + stat.verifyCount + stat.settleCount + stat.supportedCount + stat.listCount,
      0
    );

    const totalSuccesses = allStats.reduce(
      (sum, stat) => sum + stat.successCount,
      0
    );

    const totalFailures = allStats.reduce(
      (sum, stat) => sum + stat.failureCount,
      0
    );

    const avgResponseTime =
      allStats.length > 0
        ? allStats.reduce((sum, stat) => sum + stat.averageResponseTimeMs, 0) /
          allStats.length
        : 0;

    const successRate =
      totalSuccesses + totalFailures > 0
        ? (totalSuccesses / (totalSuccesses + totalFailures)) * 100
        : 0;

    return {
      totalOperations,
      totalSuccesses,
      totalFailures,
      successRate: successRate.toFixed(2) + "%",
      averageResponseTimeMs: Math.round(avgResponseTime),
      facilitatorsTracked: allStats.length,
      totalLogEntries: this.logs.length,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Clear statistics for a facilitator
   */
  clearStats(facilitatorId: string) {
    this.stats.delete(facilitatorId);
  }

  /**
   * Clear all statistics
   */
  clearAllStats() {
    this.stats.clear();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export statistics as JSON
   */
  exportStats(): string {
    return JSON.stringify(Array.from(this.stats.values()), null, 2);
  }

  /**
   * Get performance metrics by time window
   */
  getMetricsByTimeWindow(windowMinutes: number = 5) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    const recentLogs = this.logs.filter(
      (log) => log.timestamp >= windowStart
    );

    const successful = recentLogs.filter((log) => log.success);
    const failed = recentLogs.filter((log) => !log.success);

    const avgResponseTime =
      recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) /
          recentLogs.length
        : 0;

    return {
      windowMinutes,
      totalRequests: recentLogs.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      successRate:
        recentLogs.length > 0
          ? ((successful.length / recentLogs.length) * 100).toFixed(2) + "%"
          : "N/A",
      averageResponseTimeMs: Math.round(avgResponseTime),
    };
  }
}
