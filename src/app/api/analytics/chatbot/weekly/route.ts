/**
 * Weekly Analytics API Route
 * 
 * Returns chatbot analytics for a date range.
 * 
 * @see .github/AI_CHATBOT_PHASE_6_ANALYTICS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyStats } from '@/lib/analytics/chatbot-analytics';

export async function GET(request: NextRequest) {
  try {
    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: 'Start and end date parameters required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse dates
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Fetch stats
    const stats = await getWeeklyStats(startDate, endDate);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Failed to fetch weekly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
