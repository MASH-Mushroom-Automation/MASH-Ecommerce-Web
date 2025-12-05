// Individual FAQ API Routes
// src/app/api/cms/faq/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FAQAPI } from '@/lib/cms/database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const faq = await FAQAPI.getById(params.id);

    if (!faq) {
      return NextResponse.json({
        success: false,
        error: 'FAQ not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: faq,
      success: true,
      message: 'FAQ retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FAQ'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Check if FAQ exists
    const existingFAQ = await CMS.findById('faq_items', params.id);
    if (!existingFAQ) {
      return NextResponse.json({
        success: false,
        error: 'FAQ not found'
      }, { status: 404 });
    }

    const updatedFAQ = await CMS.update('faq_items', params.id, body);

    return NextResponse.json({
      data: updatedFAQ,
      success: true,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update FAQ'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await CMS.delete('faq_items', params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'FAQ not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete FAQ'
    }, { status: 500 });
  }
}
