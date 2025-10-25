// Hero Section API Routes
// src/app/api/cms/hero/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { HeroAPI } from '@/lib/cms/database';
import { validateRequired } from '@/lib/cms/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const heroes = await HeroAPI.getAll();

    return NextResponse.json({
      data: heroes,
      success: true,
      message: 'Heroes retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch heroes'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const validationError = validateRequired(body, ['title', 'subtitle', 'primaryButton', 'secondaryButton']);
    if (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError
      }, { status: 400 });
    }

    // Validate button objects
    if (!body.primaryButton.text || !body.primaryButton.url) {
      return NextResponse.json({
        success: false,
        error: 'Primary button text and URL are required'
      }, { status: 400 });
    }

    if (!body.secondaryButton.text || !body.secondaryButton.url) {
      return NextResponse.json({
        success: false,
        error: 'Secondary button text and URL are required'
      }, { status: 400 });
    }

    const newHero = await HeroAPI.create({
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0
    });

    return NextResponse.json({
      data: newHero,
      success: true,
      message: 'Hero created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create hero'
    }, { status: 500 });
  }
}
