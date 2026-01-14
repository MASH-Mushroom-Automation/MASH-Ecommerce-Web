import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * 
 * Used by Railway and other platforms to verify the app is running.
 * Returns a simple JSON response with status and timestamp.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
    { status: 200 }
  );
}

// Also support HEAD requests for health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
