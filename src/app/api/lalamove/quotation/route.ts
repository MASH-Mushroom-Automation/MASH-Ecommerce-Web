/**
 * Lalamove Quotation API Route
 * POST /api/lalamove/quotation
 * 
 * Get delivery price quote for customer's address
 * Call this during checkout before order confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLalamoveClient, LalamoveQuotationRequest } from '@/lib/lalamove/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress, serviceType } = body;
    
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return NextResponse.json(
        { success: false, message: 'Missing coordinates' },
        { status: 400 }
      );
    }

    // Build quotation request
    const quotationRequest: LalamoveQuotationRequest = {
      serviceType: serviceType || 'MOTORCYCLE', // Default to motorcycle for fresh produce
      language: 'en_PH',
      stops: [
        {
          coordinates: {
            lat: pickupLat.toString(),
            lng: pickupLng.toString(),
          },
          address: pickupAddress || 'MASH E-Commerce Store',
        },
        {
          coordinates: {
            lat: dropoffLat.toString(),
            lng: dropoffLng.toString(),
          },
          address: dropoffAddress || 'Customer Address',
        },
      ],
      item: {
        quantity: '1',
        weight: 'LESS_THAN_3_KG', // Fresh mushrooms typically < 3kg
        categories: ['FOOD_DELIVERY'],
        handlingInstructions: ['KEEP_UPRIGHT'], // Prevent mushroom damage
      },
    };

    // Optional: Schedule delivery for later
    if (body.scheduleAt) {
      quotationRequest.scheduleAt = body.scheduleAt;
    }

    // Get quotation from Lalamove
    const lalamove = getLalamoveClient();
    const quotation = await lalamove.getQuotation(quotationRequest);

    console.log('[API] Quotation created:', {
      quotationId: quotation.quotationId,
      price: quotation.priceBreakdown.total,
      currency: quotation.priceBreakdown.currency,
      distance: quotation.distance,
    });

    return NextResponse.json({
      success: true,
      data: {
        quotationId: quotation.quotationId,
        price: quotation.priceBreakdown.total,
        currency: quotation.priceBreakdown.currency,
        priceBreakdown: quotation.priceBreakdown,
        distance: quotation.distance,
        expiresAt: quotation.expiresAt,
        stops: quotation.stops,
      },
    });

  } catch (error: any) {
    console.error('[API] Quotation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get delivery quotation',
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lalamove/quotation?quotationId=xxx
 * Retrieve existing quotation details
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const quotationId = searchParams.get('quotationId');

    if (!quotationId) {
      return NextResponse.json(
        { success: false, message: 'quotationId required' },
        { status: 400 }
      );
    }

    const lalamove = getLalamoveClient();
    const quotation = await lalamove.getQuotationDetails(quotationId);

    return NextResponse.json({
      success: true,
      data: quotation,
    });

  } catch (error: any) {
    console.error('[API] Get quotation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get quotation details',
      },
      { status: 500 }
    );
  }
}
