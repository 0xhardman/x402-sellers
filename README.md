# x402 Seller Demo - Next.js Implementation

A complete implementation of the x402 payment protocol for API monetization using Next.js. This demo showcases how to protect API endpoints with cryptocurrency payments on Base Sepolia testnet.

## Features

- **Payment-Protected API Endpoints**: Three demo endpoints with different pricing tiers
- **Interactive Demo Dashboard**: Test API endpoints with and without payments
- **Custom Middleware**: x402 payment verification with Next.js middleware
- **Full UI Implementation**: Homepage, demo dashboard, and testing utilities
- **Environment Configuration**: Flexible setup with environment variables
- **Comprehensive Testing Tools**: CURL commands and integration guides

## Quick Start

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone [your-repo-url]
cd x402-seller
npm install
```

### 2. Configuration

Copy the example environment file and update with your wallet address:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your wallet address:

```env
NEXT_PUBLIC_WALLET_ADDRESS=0xYourWalletAddressHere
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

## API Endpoints

### Weather API - `/api/weather`
- **Price**: $0.001
- **Description**: Returns current weather data
- **Method**: GET, POST
- **Example Response**:
```json
{
  "success": true,
  "data": {
    "location": "New York",
    "temperature": 22,
    "conditions": "Sunny",
    "humidity": 65,
    "wind_speed": 12
  }
}
```

### Premium Data API - `/api/premium-data`
- **Price**: $0.01
- **Description**: Market data with trends and predictions
- **Method**: GET, POST
- **Example Response**:
```json
{
  "success": true,
  "data": {
    "market_data": { ... },
    "trends": [ ... ],
    "predictions": { ... }
  }
}
```

### Analytics API - `/api/analytics`
- **Price**: $0.05
- **Description**: Complex analytics with AI-powered insights
- **Method**: GET, POST
- **Query Parameters**:
  - `depth`: Analysis depth (comprehensive/basic)
  - `focus`: Focus area (general/revenue/user)
  - `timeRange`: Time range (7d/30d/90d)

## Testing the Integration

### 1. Test Without Payment (402 Response)

```bash
curl -v http://localhost:3000/api/weather
```

Expected response: `402 Payment Required`

### 2. Test With Mock Payment Header

```bash
curl -H "X-PAYMENT: mock-signature" http://localhost:3000/api/weather
```

Note: This will fail payment verification in production. Use proper x402 client for real payments.

### 3. Test POST Request with Parameters

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"depth": "comprehensive", "focus": "revenue"}'
```

## Payment Flow

1. **Client Request**: Client requests protected endpoint
2. **402 Response**: Server returns 402 with payment instructions
3. **Payment Signing**: Client signs payment with wallet
4. **Verified Request**: Client resends with X-PAYMENT header
5. **API Response**: Server verifies and returns data

## Project Structure

```
x402-seller/
├── app/
│   ├── api/
│   │   ├── weather/route.ts      # Weather endpoint
│   │   ├── premium-data/route.ts # Premium data endpoint
│   │   └── analytics/route.ts    # Analytics endpoint
│   ├── demo/page.tsx             # Interactive demo dashboard
│   ├── test/page.tsx             # Testing utilities page
│   └── page.tsx                  # Homepage
├── middleware.ts                 # x402 payment middleware
├── .env.local.example           # Environment variables template
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WALLET_ADDRESS` | Your receiving wallet address | Required |
| `NEXT_PUBLIC_FACILITATOR_URL` | Facilitator URL | https://x402.org/facilitator |
| `NEXT_PUBLIC_NETWORK` | Network (base-sepolia/base) | base-sepolia |
| `NEXT_PUBLIC_WEATHER_PRICE` | Weather API price (USD) | 0.001 |
| `NEXT_PUBLIC_PREMIUM_DATA_PRICE` | Premium Data API price | 0.01 |
| `NEXT_PUBLIC_ANALYTICS_PRICE` | Analytics API price | 0.05 |

## Getting Test Tokens

To test payments on Base Sepolia:

1. **Get Test ETH**: Visit [Base Sepolia Faucet](https://docs.base.org/docs/tools/network-faucets)
2. **Get Test USDC**: Use a USDC faucet for Base Sepolia
3. **Configure Wallet**: Add Base Sepolia network to your wallet
4. **Monitor Transactions**: Use [Base Sepolia Explorer](https://sepolia.basescan.org/)

## Production Deployment

For production deployment on Base mainnet:

1. Update `NEXT_PUBLIC_NETWORK` to `base`
2. Use mainnet facilitator (see Coinbase CDP docs)
3. Ensure wallet can receive on Base mainnet
4. Update pricing as needed
5. Deploy to your hosting provider

## Troubleshooting

### 402 Payment Required
- This is expected behavior for unpaid requests
- Include valid X-PAYMENT header to access endpoints

### Invalid Wallet Address
- Ensure wallet address in `.env.local` is valid
- Must be EVM-compatible address

### Network Issues
- Check you're on correct network (Base Sepolia for testing)
- Ensure facilitator URL is accessible

## Resources

- [x402 Documentation](https://x402.gitbook.io/x402/)
- [x402 GitHub Repository](https://github.com/coinbase/x402)
- [Base Sepolia Faucet](https://docs.base.org/docs/tools/network-faucets)
- [Coinbase CDP Documentation](https://docs.cdp.coinbase.com/x402/)

## License

MIT

## Support

For questions or support:
- Join the [x402 Discord](https://discord.gg/invite/cdp)
- Open an issue on GitHub
- Check the documentation

---

Built with x402 Payment Protocol