import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";

// Configuration from environment variables
const WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
const FACILITATOR_URL =
  process.env.NEXT_PUBLIC_FACILITATOR_URL || "https://x402.org/facilitator";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "base-sepolia";

// Pricing configuration (in USD)
const WEATHER_PRICE = process.env.NEXT_PUBLIC_WEATHER_PRICE || "0.001";
const PREMIUM_DATA_PRICE = process.env.NEXT_PUBLIC_PREMIUM_DATA_PRICE || "0.01";
const ANALYTICS_PRICE = process.env.NEXT_PUBLIC_ANALYTICS_PRICE || "0.05";

// Log configuration on startup (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("x402 Configuration:", {
    wallet: WALLET_ADDRESS,
    facilitator: FACILITATOR_URL,
    network: NETWORK,
    prices: {
      weather: WEATHER_PRICE,
      premiumData: PREMIUM_DATA_PRICE,
      analytics: ANALYTICS_PRICE,
    },
  });
}

// Configure the x402 payment middleware
export const middleware = paymentMiddleware(
  WALLET_ADDRESS as `0x${string}`,
  {
    // Demo weather API - low cost endpoint
    "/api/weather": {
      price: `$${WEATHER_PRICE}`,
      network: NETWORK as "base-sepolia" | "base",
      config: {
        description: "Get current weather data",
        mimeType: "application/json",
        maxTimeoutSeconds: 60,
        outputSchema: {
          type: "object",
          properties: {
            location: { type: "string" },
            temperature: { type: "number" },
            conditions: { type: "string" },
            humidity: { type: "number" },
            wind_speed: { type: "number" },
          },
        },
      },
    },
    // Premium data API - medium cost endpoint
    "/api/premium-data": {
      price: `$${PREMIUM_DATA_PRICE}`,
      network: NETWORK as "base-sepolia" | "base",
      config: {
        description: "Access premium market data and analytics",
        mimeType: "application/json",
        maxTimeoutSeconds: 60,
        outputSchema: {
          type: "object",
          properties: {
            market_data: { type: "object" },
            trends: { type: "array" },
            predictions: { type: "object" },
            timestamp: { type: "string" },
          },
        },
      },
    },
    // Analytics API - higher cost endpoint
    "/api/analytics": {
      price: `$${ANALYTICS_PRICE}`,
      network: NETWORK as "base-sepolia" | "base",
      config: {
        description: "Complex data analytics and insights",
        mimeType: "application/json",
        maxTimeoutSeconds: 120,
        outputSchema: {
          type: "object",
          properties: {
            analysis: { type: "object" },
            insights: { type: "array" },
            recommendations: { type: "array" },
            confidence_score: { type: "number" },
            generated_at: { type: "string" },
          },
        },
      },
    },
  },
  // {
  //   // Use the facilitator URL from environment or default
  //   url: FACILITATOR_URL as `${string}://${string}`,
  // }
  facilitator
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/weather", "/api/premium-data", "/api/analytics"],
};
