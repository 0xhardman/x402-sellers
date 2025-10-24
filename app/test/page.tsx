'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, commandId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
    });
  };

  const testCommands = [
    {
      id: 'weather-no-payment',
      title: 'Test Weather API (No Payment)',
      description: 'This will return a 402 Payment Required response',
      command: 'curl -v http://localhost:3000/api/weather',
      expectedResponse: {
        status: 402,
        body: 'Payment Required - Include X-PAYMENT header'
      }
    },
    {
      id: 'weather-with-payment',
      title: 'Test Weather API (With Mock Payment)',
      description: 'This simulates a paid request (will fail verification in production)',
      command: 'curl -H "X-PAYMENT: mock-payment-signature" http://localhost:3000/api/weather',
      expectedResponse: {
        status: 200,
        body: '{ "success": true, "data": { ... } }'
      }
    },
    {
      id: 'premium-no-payment',
      title: 'Test Premium Data API (No Payment)',
      description: 'This will return a 402 Payment Required response',
      command: 'curl -v http://localhost:3000/api/premium-data',
      expectedResponse: {
        status: 402,
        body: 'Payment Required - $0.01 on Base Sepolia'
      }
    },
    {
      id: 'analytics-post',
      title: 'Test Analytics API with POST',
      description: 'Send custom parameters to analytics endpoint',
      command: `curl -X POST http://localhost:3000/api/analytics \\
  -H "Content-Type: application/json" \\
  -d '{"depth": "comprehensive", "focus": "revenue", "timeRange": "7d"}'`,
      expectedResponse: {
        status: 402,
        body: 'Payment Required - $0.05'
      }
    },
    {
      id: 'check-headers',
      title: 'Check Response Headers',
      description: 'View all headers returned by the payment middleware',
      command: 'curl -I http://localhost:3000/api/weather',
      expectedResponse: {
        status: 402,
        headers: ['X-Payment-Required', 'X-Payment-Network', 'X-Payment-Price']
      }
    }
  ];

  const integrationSteps = [
    {
      step: 1,
      title: 'Get Test Tokens',
      description: 'Obtain test USDC on Base Sepolia',
      details: [
        'Visit the Base Sepolia faucet',
        'Get test ETH for gas',
        'Get test USDC from a faucet',
        'Wallet address will receive payments'
      ]
    },
    {
      step: 2,
      title: 'Configure Your Wallet',
      description: 'Set up your receiving wallet address',
      details: [
        'Update NEXT_PUBLIC_WALLET_ADDRESS in .env.local',
        'Use any EVM-compatible wallet',
        'Ensure wallet can receive on Base Sepolia',
        'Payments will be sent to this address'
      ]
    },
    {
      step: 3,
      title: 'Test Payment Flow',
      description: 'Complete an end-to-end payment',
      details: [
        'Make request without payment → Get 402',
        'Sign payment with x402 client',
        'Include X-PAYMENT header',
        'Receive API response after verification'
      ]
    },
    {
      step: 4,
      title: 'Monitor Transactions',
      description: 'Track payments on-chain',
      details: [
        'View transactions on Base Sepolia explorer',
        'Verify USDC transfers',
        'Check facilitator logs',
        'Monitor your wallet balance'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Testing Guide
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Test commands and integration steps for x402 payments
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Test Commands Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Test Commands
          </h2>
          <div className="grid gap-6">
            {testCommands.map((cmd) => (
              <div key={cmd.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cmd.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {cmd.description}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(cmd.command, cmd.id)}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {copiedCommand === cmd.id ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 mb-4">
                  <code className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {cmd.command}
                  </code>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Expected Response:
                  </p>
                  {cmd.expectedResponse.status && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Status: <span className={cmd.expectedResponse.status === 200 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                        {cmd.expectedResponse.status}
                      </span>
                    </p>
                  )}
                  {cmd.expectedResponse.body && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Body: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                        {cmd.expectedResponse.body}
                      </code>
                    </p>
                  )}
                  {cmd.expectedResponse.headers && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Headers: {cmd.expectedResponse.headers.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Integration Steps
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {integrationSteps.map((item) => (
              <div key={item.step} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-bold">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                    <ul className="space-y-1">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-green-500 mr-2">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Flow Diagram */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payment Flow
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Client Request</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client sends GET request to /api/weather
                  </p>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-300 font-bold">2</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">402 Response</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Server returns 402 with payment instructions
                  </p>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-300 font-bold">3</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Payment Signing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client signs payment with wallet
                  </p>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 font-bold">4</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Verified Request</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client resends request with X-PAYMENT header
                  </p>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 font-bold">✓</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">API Response</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Server returns the requested data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Helpful Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="https://docs.base.org/docs/tools/network-faucets"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Base Sepolia Faucet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get test ETH and tokens for Base Sepolia
              </p>
            </a>

            <a
              href="https://sepolia.basescan.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Block Explorer
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View transactions on Base Sepolia
              </p>
            </a>

            <a
              href="https://x402.gitbook.io/x402/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                x402 Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete x402 protocol documentation
              </p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}