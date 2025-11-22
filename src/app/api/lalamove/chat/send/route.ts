/**
 * Lalamove Chat System - SMS Relay
 * POST /api/lalamove/chat/send
 * 
 * Sends customer messages to driver via SMS (Twilio/Vonage)
 * Since Lalamove doesn't have chat API, we relay messages via SMS
 */

import { NextRequest, NextResponse } from 'next/server';

// Twilio client (install: npm install twilio)
// import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, message, driverPhone, customerName } = body;

    // Validation
    if (!orderId || !message || !driverPhone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order ID, message, and driver phone are required' 
        },
        { status: 400 }
      );
    }

    // Validate phone format (E.164)
    if (!driverPhone.match(/^\+63[0-9]{10}$/)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid phone format. Must be E.164 (+639XXXXXXXXX)' 
        },
        { status: 400 }
      );
    }

    // Validate message length (160 chars for single SMS)
    if (message.length > 160) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message too long. Maximum 160 characters.' 
        },
        { status: 400 }
      );
    }

    console.log(`[Lalamove Chat] Sending message to driver:`, {
      orderId,
      driverPhone,
      messageLength: message.length,
    });

    // Format SMS message
    const smsBody = `[MASH Order ${orderId}] ${customerName || 'Customer'}: ${message}`;

    // TODO: Implement Twilio SMS sending when credentials available
    // For now, we'll simulate it
    const USE_TWILIO = false; // Set to true when Twilio is configured

    let smsId: string | null = null;
    let status: 'sent' | 'failed' = 'sent';

    if (USE_TWILIO) {
      /*
      // Uncomment when Twilio is configured:
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const messageSent = await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: driverPhone,
      });

      smsId = messageSent.sid;
      status = messageSent.status === 'queued' || messageSent.status === 'sent' ? 'sent' : 'failed';
      */
    } else {
      // Simulation mode - log to console
      console.log('[Lalamove Chat] SMS SIMULATION (Twilio not configured)');
      console.log(`TO: ${driverPhone}`);
      console.log(`FROM: ${process.env.TWILIO_PHONE_NUMBER || '+639XXXXXXXXX'}`);
      console.log(`BODY: ${smsBody}`);
      smsId = `sim_${Date.now()}`; // Simulated message ID
    }

    // Store message in database
    // TODO: Save to Firestore or PostgreSQL
    const chatMessage = {
      id: smsId,
      orderId,
      sender: 'customer',
      message,
      timestamp: new Date().toISOString(),
      status,
      smsId,
      driverPhone,
      customerName: customerName || 'Customer',
    };

    console.log('[Lalamove Chat] Message stored:', chatMessage);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        messageId: smsId,
        status,
        sentAt: new Date().toISOString(),
        message: USE_TWILIO 
          ? 'Message sent to driver via SMS' 
          : 'Message simulated (Twilio not configured)',
        cost: USE_TWILIO ? '₱1.00' : '₱0 (simulation)',
      },
    });

  } catch (error: any) {
    console.error('[Lalamove Chat] Error:', error);

    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to send message' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get chat history for an order
 * GET /api/lalamove/chat?orderId=xxx
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: 'Order ID is required' },
      { status: 400 }
    );
  }

  // TODO: Fetch from database
  // For now, return mock data
  const mockMessages = [
    {
      id: '1',
      orderId,
      sender: 'system',
      message: 'Driver assigned! You can now message the driver.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'sent',
    },
    {
      id: '2',
      orderId,
      sender: 'customer',
      message: 'Hi, I\'m at the office lobby',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'delivered',
    },
    {
      id: '3',
      orderId,
      sender: 'driver',
      message: 'Ok po, 5 minutes away',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      status: 'read',
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      orderId,
      messages: mockMessages,
      totalMessages: mockMessages.length,
      note: 'Mock data - integrate with database for production',
    },
  });
}
