import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url;
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    // Follow redirects server-side to get final resolved URL which may include embed/pb
    const res = await fetch(url, { redirect: 'follow' });
    const finalUrl = res.url;

    // Basic heuristics: prefer `/maps/embed` or presence of `pb=` or `/maps/place`
    if (finalUrl && (finalUrl.includes('/maps/embed') || finalUrl.includes('pb=') || finalUrl.includes('/maps/place'))) {
      return NextResponse.json({ embedUrl: finalUrl }, { status: 200 });
    }

    // As a fallback, return a search-based embed using the original URL as a query
    return NextResponse.json({ embedUrl: null }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ embedUrl: null, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
