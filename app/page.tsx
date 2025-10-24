'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              x402 Seller Demo
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Network: Base Sepolia
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to x402 Payment Protocol Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This demo showcases how to implement the x402 payment protocol for API monetization.
            Your API endpoints are now protected with cryptocurrency payments on Base Sepolia testnet.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/demo"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Demo Dashboard
            </Link>
            <Link
              href="/test"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Test API Endpoints
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {['overview', 'endpoints', 'pricing', 'integration'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="text-2xl mb-3">1️⃣</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Request API
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Client makes a request to a protected endpoint
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="text-2xl mb-3">2️⃣</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Payment Required
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Server responds with 402 status and payment instructions
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="text-2xl mb-3">3️⃣</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Access Granted
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      After payment verification, API returns the data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Endpoints Tab */}
            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Protected API Endpoints
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        GET /api/weather
                      </h4>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        $0.001
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Returns current weather data for various locations
                    </p>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono">
                      curl http://localhost:3000/api/weather
                    </code>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        GET /api/premium-data
                      </h4>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        $0.01
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Access premium market data and analytics
                    </p>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono">
                      curl http://localhost:3000/api/premium-data
                    </code>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        GET /api/analytics
                      </h4>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                        $0.05
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Complex data analytics and insights with AI-powered recommendations
                    </p>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono">
                      curl http://localhost:3000/api/analytics
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Pricing Tiers
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Basic Tier
                    </h4>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                      $0.001
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Per request
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>✓ Weather data</li>
                      <li>✓ Basic information</li>
                      <li>✓ 60s cache</li>
                    </ul>
                  </div>

                  <div className="border border-blue-500 dark:border-blue-400 rounded-lg p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        POPULAR
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Premium Tier
                    </h4>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      $0.01
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Per request
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>✓ Market data</li>
                      <li>✓ Trend analysis</li>
                      <li>✓ Predictions</li>
                      <li>✓ Real-time updates</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Enterprise Tier
                    </h4>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                      $0.05
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Per request
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>✓ Complex analytics</li>
                      <li>✓ AI insights</li>
                      <li>✓ Custom metrics</li>
                      <li>✓ Recommendations</li>
                      <li>✓ Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Integration Guide
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      1. Install Dependencies
                    </h4>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm">
                      npm install x402-next @coinbase/x402
                    </code>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      2. Configure Middleware
                    </h4>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm overflow-x-auto">
{`import { paymentMiddleware } from 'x402-next';

export const middleware = paymentMiddleware(
  "0xYourWalletAddress",
  {
    '/api/protected': {
      price: '$0.01',
      network: 'base-sepolia'
    }
  },
  {
    url: 'https://x402.org/facilitator'
  }
);`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      3. Test with Payment Header
                    </h4>
                    <code className="block bg-gray-100 dark:bg-gray-700 p-4 rounded font-mono text-sm">
                      curl -H "X-PAYMENT: [payment_signature]" http://localhost:3000/api/protected
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resources
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  x402 Documentation
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn more about the x402 payment protocol
                </p>
              </div>
            </a>
            <a
              href="https://github.com/coinbase/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  GitHub Repository
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View source code and examples
                </p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}