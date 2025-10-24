'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ApiResponse {
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface PaymentError {
  status: number;
  message: string;
  price?: string;
  instructions?: string;
}

export default function DemoPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/weather');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [loading, setLoading] = useState(false);
  const [includePayment, setIncludePayment] = useState(false);
  const [customHeaders, setCustomHeaders] = useState('');

  const endpoints = [
    {
      path: '/api/weather',
      name: 'Weather API',
      price: '$0.001',
      description: 'Get current weather data',
      color: 'green'
    },
    {
      path: '/api/premium-data',
      name: 'Premium Data API',
      price: '$0.01',
      description: 'Access market data and trends',
      color: 'blue'
    },
    {
      path: '/api/analytics',
      name: 'Analytics API',
      price: '$0.05',
      description: 'Complex analytics with AI insights',
      color: 'purple'
    }
  ];

  const testEndpoint = async () => {
    setLoading(true);
    setResponse(null);
    setPaymentError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add custom headers if provided
      if (customHeaders.trim()) {
        try {
          const customHeadersObj = JSON.parse(customHeaders);
          Object.assign(headers, customHeadersObj);
        } catch (e) {
          console.error('Invalid custom headers JSON');
        }
      }

      // Add mock payment header if checkbox is checked
      if (includePayment) {
        headers['X-PAYMENT'] = 'mock-payment-signature-for-demo';
      }

      const res = await fetch(selectedEndpoint, {
        method: 'GET',
        headers
      });

      if (res.status === 402) {
        // Payment required
        const errorText = await res.text();
        setPaymentError({
          status: 402,
          message: 'Payment Required',
          price: endpoints.find(e => e.path === selectedEndpoint)?.price,
          instructions: 'Include X-PAYMENT header with valid payment signature'
        });
      } else if (res.ok) {
        const data = await res.json();
        setResponse(data);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        setResponse(errorData);
      }
    } catch (error: any) {
      setResponse({
        error: 'Network Error',
        message: error.message || 'Failed to connect to the API'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentEndpoint = endpoints.find(e => e.path === selectedEndpoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Demo Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Test x402 payment-protected endpoints
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
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Endpoint Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Endpoint
              </h2>
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <label
                    key={endpoint.path}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEndpoint === endpoint.path
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value={endpoint.path}
                        checked={selectedEndpoint === endpoint.path}
                        onChange={(e) => setSelectedEndpoint(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {endpoint.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {endpoint.description}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 bg-${endpoint.color}-100 dark:bg-${endpoint.color}-900 text-${endpoint.color}-800 dark:text-${endpoint.color}-200 rounded-full text-sm font-semibold`}>
                      {endpoint.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Request Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request Configuration
              </h2>

              {/* Payment Header Toggle */}
              <div className="mb-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includePayment}
                    onChange={(e) => setIncludePayment(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Include X-PAYMENT header (simulate paid request)
                  </span>
                </label>
              </div>

              {/* Custom Headers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Headers (JSON format)
                </label>
                <textarea
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  placeholder='{"X-Custom-Header": "value"}'
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Test Button */}
              <button
                onClick={testEndpoint}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Testing...
                  </span>
                ) : (
                  'Test Endpoint'
                )}
              </button>
            </div>

            {/* Request Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request Details
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">GET</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Endpoint:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {selectedEndpoint}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Price:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {currentEndpoint?.price}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Network:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Base Sepolia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Response */}
          <div className="space-y-6">
            {/* Response Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-h-[400px]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Response
              </h2>

              {!response && !paymentError && !loading && (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Click "Test Endpoint" to see the response</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                  </div>
                </div>
              )}

              {paymentError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                        {paymentError.status} - {paymentError.message}
                      </h3>
                      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                        This endpoint requires payment of <strong>{paymentError.price}</strong> to access.
                      </p>
                      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {paymentError.instructions}
                      </p>
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs font-mono text-red-800 dark:text-red-200">
                        To access this endpoint:<br />
                        1. Use an x402-compatible client<br />
                        2. Sign the payment payload<br />
                        3. Include the X-PAYMENT header
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {response && !paymentError && (
                <div>
                  {response.success ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="ml-2 text-green-800 dark:text-green-200 font-medium">
                          Success - Data Retrieved
                        </span>
                      </div>
                    </div>
                  ) : response.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="ml-2 text-red-800 dark:text-red-200 font-medium">
                          Error - {response.error}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* CURL Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                CURL Command
              </h2>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                <code className="text-xs text-gray-300 font-mono">
                  {includePayment ? (
                    `curl -H "X-PAYMENT: [payment_signature]" \\
     -H "Content-Type: application/json" \\
     http://localhost:3000${selectedEndpoint}`
                  ) : (
                    `curl http://localhost:3000${selectedEndpoint}`
                  )}
                </code>
              </div>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                Copy this command to test the endpoint from your terminal
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}