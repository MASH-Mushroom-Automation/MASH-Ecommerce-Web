/**
 * Server-side Gemini API Proxy
 * 
 * This route acts as a proxy for Gemini API calls, running server-side
 * to bypass VPN/DNS issues that occur with client-side fetch in Turbopack.
 * 
 * Uses Node.js native https module with IPv4 forcing to avoid VPN interference.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { GEMINI_API_ENDPOINT, HF_API_ENDPOINT, HF_FALLBACK_MODEL } from '@/lib/ai/config';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_GEMINI_TIMEOUT || '30000', 10);

/**
 * Makes a request to Gemini API using native Node.js https module
 * Forces IPv4 to avoid VPN DNS issues
 */
async function callGeminiNative(requestBody: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return new Promise((resolve) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const urlObj = new URL(apiUrl);
    
    const postData = JSON.stringify(requestBody);
    
    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: GEMINI_TIMEOUT,
      family: 4, // Force IPv4 to avoid VPN issues
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            resolve({ 
              success: false, 
              error: `Gemini API error: ${res.statusCode} - ${data}` 
            });
            return;
          }
          
          const jsonData = JSON.parse(data);
          resolve({ success: true, data: jsonData });
        } catch (parseError) {
          resolve({ 
            success: false, 
            error: `Failed to parse response: ${parseError}` 
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[Gemini Proxy] Request error:', error.message);
      resolve({ 
        success: false, 
        error: `Network error: ${error.message}` 
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: `Request timeout after ${GEMINI_TIMEOUT}ms` 
      });
    });

    req.write(postData);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    if (!key) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('[Gemini Proxy] Attempting native HTTPS call (IPv4 forced)...');
    const startTime = Date.now();

    // First try native HTTPS with IPv4 forcing to bypass VPN
    const nativeResult = await callGeminiNative(body);
    const processingTime = Date.now() - startTime;

    if (nativeResult.success && nativeResult.data) {
      console.log('[Gemini Proxy] Native HTTPS succeeded in', processingTime, 'ms');
      return NextResponse.json(nativeResult.data, { status: 200 });
    }

    console.warn('[Gemini Proxy] Native HTTPS failed:', nativeResult.error);
    console.log('[Gemini Proxy] Falling back to standard fetch...');

    // Fallback to standard fetch
    const model = body?.model || GEMINI_MODEL;
    const url = `${GEMINI_API_ENDPOINT}/models/${model}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
          const inputs = body?.contents?.map((c: { parts?: Array<{ text?: string }> }) => (c.parts?.[0]?.text)).join('\n') || body?.prompt || '';
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
