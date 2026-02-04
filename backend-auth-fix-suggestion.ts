// This file contains a suggested solution for your NestJS backend to fix the
// "401 Unauthorized" error when using HttpOnly cookies for authentication.
// Apply these changes to the corresponding files in your MASH-Backend project.

// ==============================================================================
// 1. Install Dependencies in Backend
// ==============================================================================
// Open a terminal in your MASH-Backend project folder and run:

// npm install cookie-parser
// npm install @types/cookie-parser --save-dev

// ==============================================================================
// 2. Update Your main.ts File
// File: MASH-Backend/src/main.ts
// ==============================================================================

/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // <-- IMPORT THIS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ADD THIS SECTION ---
  // Enable CORS to allow your frontend (running on localhost:3000)
  // to communicate with your backend.
  app.enableCors({
    origin: 'http://localhost:3000', // <-- Your frontend's origin
    credentials: true, // <-- IMPORTANT: This allows cookies to be sent and received
  });

  // Use the cookie-parser middleware globally.
  // This will parse the cookie header and populate req.cookies with an object.
  app.use(cookieParser()); 
  // --- END SECTION ---

  await app.listen(30000); // Or your configured backend port
}
bootstrap();
*/

// ==============================================================================
// 3. Update Your JWT Strategy (Now supporting Cookies AND Headers)
// File: MASH-Backend/src/auth/jwt.strategy.ts (or similar file)
// ==============================================================================
// The key change is telling the Passport JWT strategy to check MULTIPLE places for the token.
// This allows your API to work seamlessly with both your web app (using cookies)
// and other clients like Postman or mobile apps (using Authorization headers).

/*
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// --- IMPORTANT: Import fromExtractors and ExtractJwt ---
import { Strategy, fromExtractors, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

// --- Extractor 1: From HttpOnly Cookie ---
// This function will look for a cookie named 'auth-token' in the request
// and return its value.
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['auth-token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // --- Use fromExtractors to check multiple locations ---
      // This will first try to get the token from the 'auth-token' cookie.
      // If it's not found, it will fall back to the standard Authorization header.
      jwtFromRequest: fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      
      ignoreExpiration: false,
      
      // --- IMPORTANT ---
      // Ensure this secret matches the one used to SIGN the token
      // when the user logs in or syncs with Firebase.
      secretOrKey: process.env.JWT_SECRET, 
    });
  }

  // This function runs after the token has been successfully verified.
  // The returned value is attached to the request object as `req.user`.
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
*/
