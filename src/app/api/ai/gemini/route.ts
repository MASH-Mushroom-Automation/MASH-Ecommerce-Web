import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_API_ENDPOINT, HF_API_ENDPOINT, HF_FALLBACK_MODEL } from '@/lib/ai/config';

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

    // If Gemini reports model not found or other NOT_FOUND, attempt server-side HF fallback
    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      console.warn('[API][Gemini] Upstream returned non-OK status:', response.status, txt);

      // If 404 or NOT_FOUND in body, try HF fallback server-side
      if (response.status === 404 || txt.includes('not found') || txt.includes('NOT_FOUND')) {
        console.warn('[API][Gemini] Attempting Hugging Face server-side fallback');
        try {
          // Prepare HF payload (simple inputs prompt derived from request)
          const inputs = body?.contents?.map((c: any) => (c.parts?.[0]?.text)).join('\n') || body?.prompt || '';
          const hfUrl = `${HF_API_ENDPOINT}/${HF_FALLBACK_MODEL}`;
          const hfKey = process.env.HF_API_KEY || process.env.NEXT_PUBLIC_HF_API_KEY || '';

          const hfRes = await fetch(hfUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs, parameters: { max_new_tokens: 500, temperature: 0.7 } }),
          });

          if (hfRes.ok) {
            const hfJson = await hfRes.json().catch(() => ({}));
            const generated = Array.isArray(hfJson) ? (hfJson[0]?.generated_text || '') : (hfJson.generated_text || '');

            const fakeGemini = {
              candidates: [
                { content: { parts: [{ text: generated }], role: 'assistant' }, finishReason: 'length' },
              ],
              usageMetadata: {},
            };

            return NextResponse.json(fakeGemini, { status: 200 });
          }

          const hfErrText = await hfRes.text().catch(() => '');
          console.error('[API][Gemini] HF fallback failed:', hfRes.status, hfErrText);
        } catch (hfErr) {
          console.error('[API][Gemini] HF fallback error:', hfErr);
        }
      }

      const jsonBody = await response.json().catch(() => ({}));
      return NextResponse.json(jsonBody, { status: response.status });
    }

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
