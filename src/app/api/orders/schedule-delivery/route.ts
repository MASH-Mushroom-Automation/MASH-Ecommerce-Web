/**
 * Schedule Lalamove Delivery API Route
 * POST /api/orders/schedule-delivery
 * 
 * Called when admin approves a delivery order.
 * Creates Lalamove quotation and places order.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLalamoveClient, LalamoveQuotationRequest, LalamoveOrderRequest } from '@/lib/lalamove/client';

// Default MASH pickup location (Novaliches, QC)
const MASH_PICKUP_LOCATION = {
  lat: 14.7219,
  lng: 121.0389,
  address: '10 Susano Road, Barangay San Agustin, Novaliches, Quezon City, 1116 Metro Manila, Philippines',
  phone: '+639661692000', // Business phone
  name: 'MASH E-Commerce',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      orderId,
      orderNumber,
      quotationId, // Optional - use existing quotation if available
      customer,
      deliveryAddress,
      items,
      total,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId or orderNumber' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryAddress.lat || !deliveryAddress.lng) {
      return NextResponse.json(
        { success: false, message: 'Missing delivery address with coordinates' },
        { status: 400 }
      );
    }

    if (!customer?.phone || !customer?.name) {
      return NextResponse.json(
        { success: false, message: 'Missing customer name or phone' },
        { status: 400 }
      );
    }

    const lalamove = getLalamoveClient();
    let finalQuotationId = quotationId;
    let quotation;

    // Step 1: Get quotation if not provided
    if (!finalQuotationId) {
      console.log('[API] Creating new quotation for order:', orderNumber);

      const quotationRequest: LalamoveQuotationRequest = {
        serviceType: 'MOTORCYCLE',
        language: 'en_PH',
        stops: [
          {
            coordinates: {
              lat: MASH_PICKUP_LOCATION.lat.toString(),
              lng: MASH_PICKUP_LOCATION.lng.toString(),
            },
            address: MASH_PICKUP_LOCATION.address,
          },
          {
            coordinates: {
              lat: deliveryAddress.lat.toString(),
              lng: deliveryAddress.lng.toString(),
            },
            address: deliveryAddress.address || 'Customer Address',
          },
        ],
        item: {
          quantity: '1',
          weight: 'LESS_THAN_3_KG',
          categories: ['FOOD_DELIVERY'],
          handlingInstructions: ['KEEP_UPRIGHT'],
        },
      };

      quotation = await lalamove.getQuotation(quotationRequest);
      finalQuotationId = quotation.quotationId;

      console.log('[API] Quotation created:', {
        quotationId: finalQuotationId,
        price: quotation.priceBreakdown.total,
      });
    } else {
      // Get existing quotation details
      try {
        quotation = await lalamove.getQuotationDetails(finalQuotationId);
      } catch (err) {
        console.log('[API] Could not get existing quotation, creating new one');
        // Quotation may have expired, create a new one
        const quotationRequest: LalamoveQuotationRequest = {
          serviceType: 'MOTORCYCLE',
          language: 'en_PH',
          stops: [
            {
              coordinates: {
                lat: MASH_PICKUP_LOCATION.lat.toString(),
                lng: MASH_PICKUP_LOCATION.lng.toString(),
              },
              address: MASH_PICKUP_LOCATION.address,
            },
            {
              coordinates: {
                lat: deliveryAddress.lat.toString(),
                lng: deliveryAddress.lng.toString(),
              },
              address: deliveryAddress.address || 'Customer Address',
            },
          ],
          item: {
            quantity: '1',
            weight: 'LESS_THAN_3_KG',
            categories: ['FOOD_DELIVERY'],
            handlingInstructions: ['KEEP_UPRIGHT'],
          },
        };

        quotation = await lalamove.getQuotation(quotationRequest);
        finalQuotationId = quotation.quotationId;
      }
    }

    // Step 2: Build item description for remarks
    const itemsDescription = items?.map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ') || 'Fresh Mushrooms';

    // Ensure phone is in E.164 format
    let formattedPhone = customer.phone;
    if (!formattedPhone.startsWith('+63')) {
      // Convert 09XX format to +639XX
      if (formattedPhone.startsWith('09')) {
        formattedPhone = `+63${formattedPhone.substring(1)}`;
      } else if (formattedPhone.startsWith('9')) {
        formattedPhone = `+63${formattedPhone}`;
      }
    }

    // Step 3: Place the order
    const orderRequest: LalamoveOrderRequest = {
      quotationId: finalQuotationId,
      sender: {
        stopId: quotation.stops[0].stopId || '',
        name: MASH_PICKUP_LOCATION.name,
        phone: MASH_PICKUP_LOCATION.phone,
      },
      recipients: [
        {
          stopId: quotation.stops[1].stopId || '',
          name: customer.name,
          phone: formattedPhone,
          remarks: `Order #${orderNumber}\n${itemsDescription}\nKeep refrigerated\nHandle with care`,
          // Add COD if payment method is cod
          ...(paymentMethod === 'cod' && total && {
            payment: {
              method: 'CASH',
              amount: total.toString(),
            },
          }),
        },
      ],
      isPODEnabled: true,
      partner: 'MASH-Ecommerce',
      metadata: {
        orderId: orderId,
        orderNumber: orderNumber,
        orderDate: new Date().toISOString(),
        storeBranch: 'Novaliches Main',
        itemType: 'Fresh Mushrooms',
      },
    };

    console.log('[API] Placing Lalamove order for:', orderNumber);
    const order = await lalamove.placeOrder(orderRequest);

    console.log('[API] Order placed successfully:', {
      orderId: order.orderId,
      status: order.status,
      shareLink: order.shareLink,
    });

    return NextResponse.json({
      success: true,
      data: {
        lalamoveOrderId: order.orderId,
        status: order.status,
        driverId: order.driverId,
        shareLink: order.shareLink,
        priceBreakdown: quotation?.priceBreakdown,
        pickupLocation: {
          lat: MASH_PICKUP_LOCATION.lat,
          lng: MASH_PICKUP_LOCATION.lng,
          address: MASH_PICKUP_LOCATION.address,
        },
      },
      message: 'Delivery scheduled successfully',
    });

  } catch (error) {
    const err = error as Error;
    console.error('[API] Schedule delivery error:', err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to schedule delivery',
        error: process.env.NODE_ENV === 'development' ? err.toString() : undefined,
      },
      { status: 500 }
    );
  }
}
