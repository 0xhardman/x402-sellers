import { paymentMiddleware } from 'x402-next';

// Configuration from environment variables
const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";
const FACILITATOR_URL = process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'base-sepolia';

// Pricing configuration (in USD)
const WEATHER_PRICE = process.env.NEXT_PUBLIC_WEATHER_PRICE || '0.001';
const PREMIUM_DATA_PRICE = process.env.NEXT_PUBLIC_PREMIUM_DATA_PRICE || '0.01';
const ANALYTICS_PRICE = process.env.NEXT_PUBLIC_ANALYTICS_PRICE || '0.05';

// Log configuration on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('x402 Configuration:', {
    wallet: WALLET_ADDRESS,
    facilitator: FACILITATOR_URL,
    network: NETWORK,
    prices: {
      weather: WEATHER_PRICE,
      premiumData: PREMIUM_DATA_PRICE,
      analytics: ANALYTICS_PRICE
    }
  });
}

// Configure the x402 payment middleware
export const middleware = paymentMiddleware(
  WALLET_ADDRESS,
  {
    // Demo weather API - low cost endpoint
    '/api/weather': {
      price: `$${WEATHER_PRICE}`,
      network: NETWORK as any,
      config: {
        description: 'Get current weather data',
        mimeType: 'application/json',
        maxTimeoutSeconds: 60,
        outputSchema: {
          type: 'object',
          properties: {
            location: { type: 'string' },
            temperature: { type: 'number' },
            conditions: { type: 'string' },
            humidity: { type: 'number' },
            wind_speed: { type: 'number' }
          }
        }
      }
    },
    // Premium data API - medium cost endpoint
    '/api/premium-data': {
      price: `$${PREMIUM_DATA_PRICE}`,
      network: NETWORK as any,
      config: {
        description: 'Access premium market data and analytics',
        mimeType: 'application/json',
        maxTimeoutSeconds: 60,
        outputSchema: {
          type: 'object',
          properties: {
            market_data: { type: 'object' },
            trends: { type: 'array' },
            predictions: { type: 'object' },
            timestamp: { type: 'string' }
          }
        }
      }
    },
    // Analytics API - higher cost endpoint
    '/api/analytics': {
      price: `$${ANALYTICS_PRICE}`,
      network: NETWORK as any,
      config: {
        description: 'Complex data analytics and insights',
        mimeType: 'application/json',
        maxTimeoutSeconds: 120,
        outputSchema: {
          type: 'object',
          properties: {
            analysis: { type: 'object' },
            insights: { type: 'array' },
            recommendations: { type: 'array' },
            confidence_score: { type: 'number' },
            generated_at: { type: 'string' }
          }
        }
      }
    }
  },
  {
    // Use the facilitator URL from environment or default
    url: FACILITATOR_URL,
    // Optional: Custom paywall HTML
    customPaywallHtml: `
      <html>
        <head>
          <title>Payment Required - x402 Demo</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #333; }
            .price {
              font-size: 24px;
              color: #007bff;
              margin: 20px 0;
              font-weight: bold;
            }
            .instructions {
              background: #f8f9fa;
              border-left: 4px solid #007bff;
              padding: 15px;
              margin: 20px 0;
            }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔐 Payment Required</h1>
            <p>This endpoint requires payment via the x402 protocol.</p>
            <div class="price">{{price}}</div>
            <div class="instructions">
              <h3>How to Pay:</h3>
              <p>1. Use an x402-compatible client or wallet</p>
              <p>2. Sign the payment payload</p>
              <p>3. Include the <code>X-PAYMENT</code> header in your request</p>
            </div>
            <p><strong>Network:</strong> Base Sepolia Testnet</p>
            <p><strong>Resource:</strong> {{resource}}</p>
            <p><small>Learn more at <a href="https://x402.org">x402.org</a></small></p>
          </div>
        </body>
      </html>
    `
  }
);

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/weather',
    '/api/premium-data',
    '/api/analytics',
  ]
};