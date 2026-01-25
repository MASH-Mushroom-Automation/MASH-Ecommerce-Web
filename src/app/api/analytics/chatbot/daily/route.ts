/**
 * Daily Analytics API Route
 * 
 * Returns chatbot analytics for a specific date.
 * 
 * @see .github/AI_CHATBOT_PHASE_6_ANALYTICS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDailyStats } from '@/lib/analytics/chatbot-analytics';

export async function GET(request: NextRequest) {
  try {
    // Get date from query params
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse date
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch stats
    const stats = await getDailyStats(date);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Failed to fetch daily stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
