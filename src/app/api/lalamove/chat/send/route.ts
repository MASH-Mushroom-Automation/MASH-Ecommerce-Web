/**
 * Lalamove Chat System — Firestore-backed messaging
 * POST /api/lalamove/chat/send  — store a message in Firestore
 * GET  /api/lalamove/chat/send?orderId=xxx — read all messages from Firestore
 *
 * Messages live in: orders/{orderId}/chatMessages/{messageId}
 * The DeliveryChat component subscribes via onSnapshot for real-time updates.
 * In sandbox mode, a system auto-reply is written 3 seconds after a customer send.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase/config';

const db = getFirestore(firebaseApp);

function chatMessagesRef(orderId: string) {
  return collection(db, 'orders', orderId, 'chatMessages');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, message, driverPhone, customerName } = body;

    if (!orderId || !message) {
      return NextResponse.json(
        { success: false, message: 'Order ID and message are required' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.length > 160) {
      return NextResponse.json(
        { success: false, message: 'Message must be a string of max 160 characters.' },
        { status: 400 }
      );
    }

    const msgData = {
      sender: 'customer' as const,
      message: message.trim(),
      timestamp: Timestamp.now(),
      status: 'sent' as const,
      customerName: customerName || 'Customer',
      driverPhone: driverPhone || null,
    };

    const docRef = await addDoc(chatMessagesRef(orderId), msgData);

    // Sandbox auto-reply: write a system message after 3 seconds
    const isSandbox = (process.env.LALAMOVE_HOST || '').includes('sandbox');
    if (isSandbox) {
      setTimeout(async () => {
        try {
          await addDoc(chatMessagesRef(orderId), {
            sender: 'system',
            message: 'On my way! (Sandbox auto-reply)',
            timestamp: Timestamp.now(),
            status: 'sent',
          });
        } catch (err) {
          console.error('[Chat] Sandbox auto-reply failed:', err);
        }
      }, 3000);
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: docRef.id,
        status: 'sent',
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to send message';
    console.error('[Lalamove Chat] Error:', error);
    return NextResponse.json({ success: false, message: errMsg }, { status: 500 });
  }
}

/**
 * Get chat history for an order from Firestore
 * GET /api/lalamove/chat/send?orderId=xxx
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

  try {
    const q = query(chatMessagesRef(orderId), orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);

    const messages = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        sender: data.sender,
        message: data.message,
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp,
        status: data.status || 'sent',
      };
    });

    return NextResponse.json({
      success: true,
      data: { orderId, messages, totalMessages: messages.length },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to fetch messages';
    console.error('[Lalamove Chat] GET Error:', error);
    return NextResponse.json({ success: false, message: errMsg }, { status: 500 });
  }
}
