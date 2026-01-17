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
    
    // Detailed validation with specific error messages
    if (!dropoffLat || !dropoffLng) {
      return NextResponse.json(
        { success: false, message: 'Delivery address coordinates are missing. Please select a location on the map.' },
        { status: 400 }
      );
    }

    if (!pickupLat || !pickupLng) {
      return NextResponse.json(
        { success: false, message: 'Pickup location is not configured. Please contact support.' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (dropoffLat < -90 || dropoffLat > 90 || dropoffLng < -180 || dropoffLng > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid delivery location coordinates. Please select a valid location.' },
        { status: 400 }
      );
    }

    if (pickupLat < -90 || pickupLat > 90 || pickupLng < -180 || pickupLng > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid pickup location coordinates. Please contact support.' },
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
    
    // Enhanced error handling with specific messages
    let errorMessage = 'Failed to get delivery quotation';
    let statusCode = 500;

    // Parse Lalamove API errors
    if (error.response?.data?.errors) {
      const lalamoveErrors = error.response.data.errors;
      const errorMessages = lalamoveErrors.map((e: { message?: string }) => e.message).filter(Boolean);
      
      if (errorMessages.length > 0) {
        errorMessage = `Lalamove API: ${errorMessages.join(", ")}`;
      }
      statusCode = error.response.status || 422;
    } else if (error.message) {
      // Check for common error patterns
      if (error.message.toLowerCase().includes('outside service area')) {
        errorMessage = 'Delivery address is outside the service area. We currently only deliver within Metro Manila.';
        statusCode = 422;
      } else if (error.message.toLowerCase().includes('invalid coordinates')) {
        errorMessage = 'Invalid location coordinates. Please select a different address.';
        statusCode = 400;
      } else if (error.message.toLowerCase().includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        statusCode = 504;
      } else if (error.message.toLowerCase().includes('network')) {
        errorMessage = 'Network error connecting to delivery service. Please try again.';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
        errors: error.response?.data?.errors,
      },
      { status: statusCode }
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
