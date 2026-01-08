import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/mash-appointments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    console.log('📤 Forwarding to n8n:', body);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('📥 n8n response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Appointment request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Appointment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
