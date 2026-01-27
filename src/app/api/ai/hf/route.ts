import { NextRequest, NextResponse } from 'next/server';
import { HF_API_ENDPOINT } from '@/lib/ai/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const model = body?.model || process.env.NEXT_PUBLIC_HF_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    const key = process.env.HF_API_KEY || process.env.NEXT_PUBLIC_HF_API_KEY || '';

    if (!key) {
      return NextResponse.json({ error: 'Hugging Face API key not configured' }, { status: 500 });
    }

    const url = `${HF_API_ENDPOINT}/${model}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const jsonBody = await response.json().catch(() => ({}));
    return NextResponse.json(jsonBody, { status: response.status });
  } catch (error) {
    console.error('[API][HuggingFace] Proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

// Health check for local debugging and CI readiness
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
