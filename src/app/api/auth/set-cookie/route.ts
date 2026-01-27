/**
 * API Route: Set Secure HTTP-Only Cookie
 * POST /api/auth/set-cookie
 * 
 * Sets an HTTP-only cookie for auth tokens
 * Security: httpOnly, secure (production), sameSite=lax
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, maxAge = 7 * 24 * 60 * 60 } = body; // Default: 7 days

    if (!name || !value) {
      return NextResponse.json(
        { message: 'Cookie name and value are required' },
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

    const isProduction = process.env.NODE_ENV === 'production';

    // Create response with Set-Cookie header
    const response = NextResponse.json(
      { message: 'Cookie set successfully' },
      { status: 200 }
    );

    // Set the HTTP-only cookie
    response.cookies.set({
      name,
      value,
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge, // In seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
