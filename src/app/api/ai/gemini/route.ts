import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_API_ENDPOINT } from '@/lib/ai/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const model = body?.model || process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3-flash-preview';
    const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    if (!key) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const url = `${GEMINI_API_ENDPOINT}/models/${model}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // server-side; no timeout controller for simplicity
    });

    const jsonBody = await response.json().catch(() => ({}));
    return NextResponse.json(jsonBody, { status: response.status });
  } catch (error) {
    console.error('[API][Gemini] Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

// Health check for local debugging and CI readiness
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
