/**
 * Lalamove Orders API Route (Test Page Support)
 * POST /api/lalamove/orders
 * 
 * Simplified endpoint for test page to place orders
 * Supports Cash on Delivery (COD)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import https from 'https';

// Generate HMAC signature
function generateSignature(timestamp: string, method: string, path: string, body: string): string {
  const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;

  return crypto
    .createHmac('sha256', process.env.LALAMOVE_API_SECRET!)
    .update(rawSignature)
    .digest('hex');
}

// Make Lalamove API request
function makeRequest(method: string, path: string, body: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(process.env.LALAMOVE_HOST! + path);
    const timestamp = new Date().getTime().toString();
    const requestBody = body ? JSON.stringify(body) : '';

    const signature = generateSignature(timestamp, method, path, requestBody);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `hmac ${process.env.LALAMOVE_API_KEY}:${timestamp}:${signature}`,
        'Market': process.env.LALAMOVE_MARKET!,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `API error: ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (requestBody) {
      req.write(requestBody);
    }

    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const { quotationId, sender, recipients } = await request.json();

    if (!quotationId || !sender || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: quotationId, sender, recipients' },
        { status: 400 }
      );
    }

    // Build order request body
    const requestBody = {
      data: {
        quotationId,
        sender,
        recipients,
        isPODEnabled: true, // Require proof of delivery
        metadata: {
          source: 'MASH-Test-Page',
          testDate: new Date().toISOString(),
        },
      },
    };

    console.log('[API] Placing order with COD:', {
      quotationId,
      sender: sender.name,
      recipient: recipients[0].name,
      hasCOD: !!recipients[0].payment,
      codAmount: recipients[0].payment?.amount || 'N/A',
    });

    // Call Lalamove API
    const response = await makeRequest('POST', '/v3/orders', requestBody);

    console.log('[API] Order placed successfully:', {
      orderId: response.data.orderId,
      status: response.data.status,
    });

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        orderId: response.data.orderId,
        status: response.data.status,
        shareLink: response.data.shareLink,
        trackingUrl: `https://www.lalamove.com/track/${response.data.orderId}`,
      },
    });
  } catch (error: any) {
    console.error('[API] Order placement error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to place order',
      },
      { status: 500 }
    );
  }
}
