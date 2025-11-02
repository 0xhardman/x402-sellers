/**
 * Facilitator Aggregator Type Definitions
 *
 * This module defines types for the facilitator aggregator system,
 * which enables automatic failover between multiple X402 facilitators.
 */

import type { FacilitatorConfig } from "x402/types";

/**
 * Resource URL type - must be a valid URL format
 */
export type Resource = `${string}://${string}`;

/**
 * Facilitator with priority and metadata
 */
export interface FacilitatorWithPriority {
  /** Unique identifier for this facilitator */
  id: string;

  /** Display name for logging */
  name: string;

  /** X402 facilitator configuration */
  config: FacilitatorConfig;

  /** Priority level (1 = highest priority, lower numbers tried first) */
  priority: number;

  /** Whether this facilitator is currently enabled */
  enabled: boolean;

  /** Maximum timeout in milliseconds for requests to this facilitator */
  timeoutMs?: number;
}

/**
 * Health status for a facilitator
 */
export interface FacilitatorHealth {
  /** Facilitator ID */
  id: string;

  /** Whether the facilitator is currently healthy */
  isHealthy: boolean;

  /** Last successful check timestamp */
  lastSuccessfulCheck?: Date;

  /** Last failed check timestamp */
  lastFailedCheck?: Date;

  /** Last error message if unhealthy */
  lastError?: string;

  /** Average response time in milliseconds (from recent checks) */
  averageResponseTimeMs?: number;

  /** Number of consecutive failures */
  consecutiveFailures: number;

  /** Total number of successful requests */
  totalSuccesses: number;

  /** Total number of failed requests */
  totalFailures: number;
}

/**
 * Statistics for a facilitator
 */
export interface FacilitatorStats {
  /** Facilitator ID */
  id: string;

  /** Total number of verify calls */
  verifyCount: number;

  /** Total number of settle calls */
  settleCount: number;

  /** Total number of supported calls */
  supportedCount: number;

  /** Total number of list calls */
  listCount: number;

  /** Total number of successful calls */
  successCount: number;

  /** Total number of failed calls */
  failureCount: number;

  /** Average response time in milliseconds */
  averageResponseTimeMs: number;

  /** Last used timestamp */
  lastUsed?: Date;
}

/**
 * Aggregator configuration options
 */
export interface AggregatorConfig {
  /** List of facilitators with priority */
  facilitators: FacilitatorWithPriority[];

  /** Default timeout for facilitator requests in milliseconds */
  defaultTimeoutMs?: number;

  /** Number of retries per facilitator before moving to next */
  retriesPerFacilitator?: number;

  /** Whether to enable health checking */
  enableHealthCheck?: boolean;

  /** Health check interval in milliseconds */
  healthCheckIntervalMs?: number;

  /** Number of consecutive failures before marking as unhealthy */
  maxConsecutiveFailures?: number;

  /** Whether to enable detailed logging */
  enableLogging?: boolean;
}

/**
 * Result of a facilitator operation attempt
 */
export interface FacilitatorAttemptResult<T> {
  /** Whether the attempt was successful */
  success: boolean;

  /** The result data if successful */
  data?: T;

  /** Error if failed */
  error?: Error;

  /** Facilitator ID that was used */
  facilitatorId: string;

  /** Response time in milliseconds */
  responseTimeMs: number;

  /** Attempt number (1-indexed) */
  attemptNumber: number;
}

/**
 * Log entry for facilitator operations
 */
export interface FacilitatorLogEntry {
  /** Timestamp */
  timestamp: Date;

  /** Operation type */
  operation: "verify" | "settle" | "supported" | "list" | "health-check";

  /** Facilitator ID */
  facilitatorId: string;

  /** Facilitator name */
  facilitatorName: string;

  /** Whether the operation succeeded */
  success: boolean;

  /** Response time in milliseconds */
  responseTimeMs: number;

  /** Error message if failed */
  error?: string;

  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Error types for facilitator operations
 */
export enum FacilitatorErrorType {
  TIMEOUT = "TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  ALL_FAILED = "ALL_FAILED",
  NO_HEALTHY_FACILITATOR = "NO_HEALTHY_FACILITATOR",
  UNKNOWN = "UNKNOWN",
}

/**
 * Custom error class for facilitator operations
 */
export class FacilitatorError extends Error {
  constructor(
    message: string,
    public type: FacilitatorErrorType,
    public facilitatorId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "FacilitatorError";
  }
}
