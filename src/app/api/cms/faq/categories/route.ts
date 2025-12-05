// FAQ Categories API Routes
// src/app/api/cms/faq/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FAQAPI } from '@/lib/cms/database';

export async function GET(request: NextRequest) {
  try {
    const categories = await FAQAPI.getAllCategories();

    return NextResponse.json({
      data: categories,
      success: true,
      message: 'FAQ categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FAQ categories'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    const newCategory = await CMS.create('faq_categories', {
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0
    });

    return NextResponse.json({
      data: newCategory,
      success: true,
      message: 'FAQ category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create FAQ category'
    }, { status: 500 });
  }
}
