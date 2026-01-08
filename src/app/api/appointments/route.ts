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

    // Get response text first to handle empty responses
    const responseText = await response.text();
    
    console.log('📥 n8n raw response:', responseText);

    // If response is empty, return error
    if (!responseText || responseText.trim() === '') {
      console.error('❌ n8n returned empty response');
      return NextResponse.json(
        { error: 'n8n workflow returned empty response. Check if workflow is active and configured correctly.' },
        { status: 502 }
      );
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse n8n response as JSON:', parseError);
      return NextResponse.json(
        { error: 'n8n workflow returned invalid JSON', details: responseText.substring(0, 200) },
        { status: 502 }
      );
    }

    console.log('📥 n8n parsed response:', data);

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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
