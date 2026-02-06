/**
 * Global Error Page
 * Handles unhandled errors in Next.js app
 */
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    logger.error('Application Error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {process.env.NODE_ENV === 'development'
            ? error.message
            : "We're sorry, but something unexpected happened. Please try again."}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
