// Features Section API Routes
// src/app/api/cms/features/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FeaturesAPI } from '@/lib/cms/database';
import { validateRequired } from '@/lib/cms/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const features = await FeaturesAPI.getAll();

    return NextResponse.json({
      data: features,
      success: true,
      message: 'Features retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch features'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validationError = validateRequired(body, ['title', 'subtitle', 'features']);
    if (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError
      }, { status: 400 });
    }

    // Validate features array
    if (!Array.isArray(body.features) || body.features.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Features must be a non-empty array'
      }, { status: 400 });
    }

    // Validate each feature
    for (let i = 0; i < body.features.length; i++) {
      const feature = body.features[i];
      if (!feature.icon || !feature.headline || !feature.subheadline) {
        return NextResponse.json({
          success: false,
          error: `Feature ${i + 1}: icon, headline, and subheadline are required`
        }, { status: 400 });
      }
    }

    const newFeatureSection = await FeaturesAPI.create({
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0
    });

    return NextResponse.json({
      data: newFeatureSection,
      success: true,
      message: 'Feature section created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating feature section:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create feature section'
    }, { status: 500 });
  }
}
