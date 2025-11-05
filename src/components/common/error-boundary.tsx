"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-sm sm:text-base text-center text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-[#6A994E] hover:bg-[#6A994E]/90 text-white"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Support Link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Need help?{" "}
                <Link href="/contact" className="text-[#6A994E] hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mobile-optimized error fallback component
export function ErrorFallback({ 
  error, 
  reset 
}: { 
  error?: Error; 
  reset?: () => void 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          {reset && (
            <Button
              onClick={reset}
              className="w-full bg-[#6A994E] hover:bg-[#6A994E]/90"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
