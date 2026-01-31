/**
 * API Route: Clear Secure HTTP-Only Cookie
 * POST /api/auth/clear-cookie
 * 
 * Clears an HTTP-only cookie (logout)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Cookie name is required' },
        { status: 400 }
      );
    }

    // Validate cookie name (only allow specific auth cookies)
    const allowedCookies = ['auth-token', 'refresh-token'];
    if (!allowedCookies.includes(name)) {
      return NextResponse.json(
        { message: `Cookie ${name} is not allowed via this endpoint` },
        { status: 403 }
      );
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Cookie cleared successfully' },
      { status: 200 }
    );

    // Clear the cookie by setting maxAge to 0
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expires immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error clearing cookie:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
