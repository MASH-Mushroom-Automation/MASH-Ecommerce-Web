// Individual Hero API Routes
// src/app/api/cms/hero/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { HeroAPI } from '@/lib/cms/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const heroSlide = await HeroAPI.getById(id);

    if (!hero) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: hero,
      success: true,
      message: 'Hero retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hero'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Check if hero exists
    const existingHero = await HeroAPI.getById(params.id);
    if (!existingHero) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    const updatedHero = await HeroAPI.update(params.id, body);

    return NextResponse.json({
      data: updatedHero,
      success: true,
      message: 'Hero updated successfully'
    });
  } catch (error) {
    console.error('Error updating hero:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update hero'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await HeroAPI.delete(params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Hero not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Hero deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete hero'
    }, { status: 500 });
  }
}
