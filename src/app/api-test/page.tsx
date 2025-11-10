"use client";

import { useEffect, useState } from "react";
import { ProductsApi } from "@/lib/api/products";

export default function ApiTestPage() {
  const [status, setStatus] = useState<any>({ loading: true });
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    const vars = {
      API_URL: process.env.NEXT_PUBLIC_API_URL,
      USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
      ENABLE_API_LOGGING: process.env.NEXT_PUBLIC_ENABLE_API_LOGGING,
    };
    setEnvVars(vars);

    // Test API call
    async function test() {
      try {
        console.log("Starting API test...");
        console.log("Environment variables:", vars);

        const response = await ProductsApi.getProducts({ limit: 5 });

        console.log("API Response:", response);

        setStatus({
          loading: false,
          success: true,
          response,
          productCount: response.data.length,
        });
      } catch (error: any) {
        console.error("API Test Error:", error);
        setStatus({
          loading: false,
          success: false,
          error: error.message || String(error),
          stack: error.stack,
        });
      }
    }

    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Test Results</h2>

          {status.loading && (
            <div className="text-blue-600">Testing API connection...</div>
          )}

          {!status.loading && status.success && (
            <div>
              <div className="text-green-600 font-semibold mb-4">
                ✅ SUCCESS! Connected to Railway Backend
              </div>
              <div className="mb-4">
                <strong>Products Found:</strong> {status.productCount}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold mb-2">
                  View Full Response
                </summary>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs max-h-96">
                  {JSON.stringify(status.response, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {!status.loading && !status.success && (
            <div>
              <div className="text-red-600 font-semibold mb-4">
                ❌ ERROR: Failed to connect to API
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <strong>Error Message:</strong>
                <div className="mt-2 text-sm">{status.error}</div>
              </div>
              {status.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold mb-2">
                    View Stack Trace
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
                    {status.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
          <strong>Instructions:</strong>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Check that NEXT_PUBLIC_API_URL is set correctly</li>
            <li>Verify NEXT_PUBLIC_USE_MOCK_DATA is "false"</li>
            <li>If using mock data, set it to "true" to test mock products</li>
            <li>Open browser console (F12) for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
