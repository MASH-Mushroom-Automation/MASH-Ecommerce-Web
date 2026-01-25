/**
 * Export Analytics API Route
 * 
 * Returns chatbot analytics as CSV file.
 * 
 * @see .github/AI_CHATBOT_PHASE_6_ANALYTICS.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyStats, exportToCSV } from '@/lib/analytics/chatbot-analytics';

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

    // Fetch stats
    const stats = await getWeeklyStats(startDate, endDate);

    // Convert to CSV
    const csv = exportToCSV(stats);

    // Generate filename with date range
    const filename = `chatbot-analytics-${startParam}-to-${endParam}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[API] Failed to export analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
