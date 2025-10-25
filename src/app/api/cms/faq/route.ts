// FAQ API Routes
// src/app/api/cms/faq/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FAQAPI } from '@/lib/cms/database';

export async function GET(request: NextRequest) {
  try {
    const faqs = await FAQAPI.getFAQs();

    return NextResponse.json({
      data: faqs,
      success: true,
      message: 'FAQs retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FAQs'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.categoryId || !body.question || !body.answer) {
      return NextResponse.json({
        success: false,
        error: 'Category ID, question, and answer are required'
      }, { status: 400 });
    }

    const newFAQ = await FAQAPI.createFAQ({
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0
    });

    return NextResponse.json({
      data: newFAQ,
      success: true,
      message: 'FAQ created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create FAQ'
    }, { status: 500 });
  }
}
