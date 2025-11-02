/**
 * Facilitator Aggregator Status API
 *
 * Provides health status, statistics, and logs for the facilitator aggregator.
 * Useful for monitoring and debugging multi-facilitator setup.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAggregatorInstance } from "@/lib/create-facilitator-aggregator";
import { isAggregatorEnabled } from "@/lib/create-smart-facilitator-config";

export const dynamic = "force-dynamic";

console.log(
  "ENABLE_FACILITATOR_AGGREGATOR:",
  process.env.ENABLE_FACILITATOR_AGGREGATOR
);
console.log("isAggregatorEnabled():", isAggregatorEnabled());

export async function GET(request: NextRequest) {
  try {
    if (!isAggregatorEnabled()) {
      return NextResponse.json({
        enabled: false,
        message:
          "Facilitator aggregator is not enabled. Set ENABLE_FACILITATOR_AGGREGATOR=true to enable.",
      });
    }

    const aggregator = getAggregatorInstance();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get("include") || "all"; // all, health, stats, logs, config
    const logLimit = parseInt(searchParams.get("logLimit") || "50");

    const response: Record<string, unknown> = {
      enabled: true,
      timestamp: new Date().toISOString(),
    };

    // Include health status
    if (include === "all" || include === "health") {
      const healthStatus = aggregator.getHealthStatus();
      const healthArray = Array.from(healthStatus.values());

      response.health = {
        facilitators: healthArray.map((h) => ({
          id: h.id,
          isHealthy: h.isHealthy,
          consecutiveFailures: h.consecutiveFailures,
          totalSuccesses: h.totalSuccesses,
          totalFailures: h.totalFailures,
          successRate:
            h.totalSuccesses + h.totalFailures > 0
              ? (
                  (h.totalSuccesses / (h.totalSuccesses + h.totalFailures)) *
                  100
                ).toFixed(2) + "%"
              : "N/A",
          averageResponseTimeMs: h.averageResponseTimeMs
            ? Math.round(h.averageResponseTimeMs)
            : null,
          lastSuccessfulCheck: h.lastSuccessfulCheck?.toISOString(),
          lastFailedCheck: h.lastFailedCheck?.toISOString(),
          lastError: h.lastError,
        })),
        summary: {
          total: healthArray.length,
          healthy: healthArray.filter((h) => h.isHealthy).length,
          unhealthy: healthArray.filter((h) => !h.isHealthy).length,
        },
      };
    }

    // Include statistics
    if (include === "all" || include === "stats") {
      const stats = aggregator.getStatistics();

      response.statistics = {
        facilitators: stats.map((s) => ({
          id: s.id,
          operations: {
            verify: s.verifyCount,
            settle: s.settleCount,
            supported: s.supportedCount,
            list: s.listCount,
            total:
              s.verifyCount + s.settleCount + s.supportedCount + s.listCount,
          },
          results: {
            success: s.successCount,
            failure: s.failureCount,
            successRate:
              s.successCount + s.failureCount > 0
                ? (
                    (s.successCount / (s.successCount + s.failureCount)) *
                    100
                  ).toFixed(2) + "%"
                : "N/A",
          },
          performance: {
            averageResponseTimeMs: Math.round(s.averageResponseTimeMs),
          },
          lastUsed: s.lastUsed?.toISOString(),
        })),
      };
    }

    // Include recent logs
    if (include === "all" || include === "logs") {
      const logs = aggregator.getRecentLogs(logLimit);

      response.logs = {
        count: logs.length,
        limit: logLimit,
        entries: logs.map((log) => ({
          timestamp: log.timestamp.toISOString(),
          operation: log.operation,
          facilitatorId: log.facilitatorId,
          facilitatorName: log.facilitatorName,
          success: log.success,
          responseTimeMs: log.responseTimeMs,
          error: log.error,
          context: log.context,
        })),
      };
    }

    // Include configuration
    if (include === "all" || include === "config") {
      const config = aggregator.getConfig();

      response.config = {
        facilitators: config.facilitators.map((f) => ({
          id: f.id,
          name: f.name,
          priority: f.priority,
          enabled: f.enabled,
          timeoutMs: f.timeoutMs,
          url: f.config.url,
          hasAuthHeaders: !!f.config.createAuthHeaders,
        })),
        settings: {
          defaultTimeoutMs: config.config.defaultTimeoutMs,
          retriesPerFacilitator: config.config.retriesPerFacilitator,
          enableHealthCheck: config.config.enableHealthCheck,
          healthCheckIntervalMs: config.config.healthCheckIntervalMs,
          maxConsecutiveFailures: config.config.maxConsecutiveFailures,
          enableLogging: config.config.enableLogging,
        },
      };
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Facilitator Status API] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to get facilitator status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to manually trigger health check
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAggregatorEnabled()) {
      return NextResponse.json(
        {
          error: "Facilitator aggregator is not enabled",
        },
        { status: 400 }
      );
    }

    const aggregator = getAggregatorInstance();

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "check-health": {
        await aggregator.checkHealth();
        const health = aggregator.getHealthStatus();

        return NextResponse.json({
          success: true,
          message: "Health check completed",
          health: Array.from(health.values()).map((h) => ({
            id: h.id,
            isHealthy: h.isHealthy,
            consecutiveFailures: h.consecutiveFailures,
          })),
        });
      }

      default:
        return NextResponse.json(
          {
            error: "Unknown action",
            validActions: ["check-health"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Facilitator Status API] POST Error:", error);

    return NextResponse.json(
      {
        error: "Operation failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
