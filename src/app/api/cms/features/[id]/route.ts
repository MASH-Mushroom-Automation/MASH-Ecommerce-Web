// Individual Features API Routes
// src/app/api/cms/features/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { FeaturesAPI } from '@/lib/cms/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const feature = await FeatureAPI.getById(id);

    if (!feature) {
      return NextResponse.json({
        success: false,
        error: 'Feature section not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      data: feature,
      success: true,
      message: 'Feature section retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching feature section:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feature section'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Check if feature exists
    const existingFeature = await FeaturesAPI.getById(params.id);
    if (!existingFeature) {
      return NextResponse.json({
        success: false,
        error: 'Feature section not found'
      }, { status: 404 });
    }

    const updatedFeature = await FeaturesAPI.update(params.id, body);

    return NextResponse.json({
      data: updatedFeature,
      success: true,
      message: 'Feature section updated successfully'
    });
  } catch (error) {
    console.error('Error updating feature section:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update feature section'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const deleted = await FeaturesAPI.delete(params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Feature section not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feature section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feature section:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete feature section'
    }, { status: 500 });
  }
}
