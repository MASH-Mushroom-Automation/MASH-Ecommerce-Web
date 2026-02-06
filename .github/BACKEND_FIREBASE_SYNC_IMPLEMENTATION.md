# Backend Firebase Sync Implementation Guide

## Overview

This document describes the required backend endpoint for syncing Firebase-authenticated users to the NestJS PostgreSQL backend.

## Security Flow

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Backend       │      │   Firebase      │
│   (Next.js)     │      │   (NestJS)      │      │   Admin SDK     │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ 1. Google Login        │                        │
         │ ──────────────────────►│                        │
         │    (Firebase SDK)      │                        │
         │                        │                        │
         │ 2. Get ID Token        │                        │
         │ ◄──────────────────────│                        │
         │                        │                        │
         │ 3. POST /auth/firebase/sync                     │
         │    Authorization: Bearer {idToken}              │
         │ ──────────────────────►│                        │
         │                        │                        │
         │                        │ 4. Verify ID Token     │
         │                        │ ──────────────────────►│
         │                        │                        │
         │                        │ 5. Token Valid +       │
         │                        │    User Data           │
         │                        │ ◄──────────────────────│
         │                        │                        │
         │                        │ 6. Upsert User         │
         │                        │    (PostgreSQL)        │
         │                        │                        │
         │ 7. Response:           │                        │
         │    - user object       │                        │
         │    - accessToken (JWT) │                        │
         │    - refreshToken      │                        │
         │    - Set-Cookie        │                        │
         │ ◄──────────────────────│                        │
         │                        │                        │
```

## Required Backend Endpoint

### POST `/api/v1/auth/firebase/sync`

#### Request

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <firebase-id-token>
```

**Body (optional - for additional data):**

```json
{
  "displayName": "John Doe",
  "photoURL": "https://lh3.googleusercontent.com/..."
}
```

> ⚠️ **IMPORTANT**: Backend must NOT trust the body data. All critical user info (email, uid) must come from verified Firebase ID token.

#### Response

**Success (200):**

```json
{
  "user": {
    "id": "uuid-from-postgres",
    "email": "user@gmail.com",
    "firebaseUid": "firebase-uid-123",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "imageUrl": "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=johndoe",
    "role": "BUYER",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-token-string"
}
```

**Error (401 - Invalid Token):**

```json
{
  "statusCode": 401,
  "message": "Invalid Firebase ID token",
  "error": "Unauthorized"
}
```

## NestJS Implementation

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin

```typescript
// src/config/firebase-admin.config.ts
import * as admin from "firebase-admin";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;
```

### 3. Create Firebase Auth Guard

```typescript
// src/auth/guards/firebase-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { firebaseAdmin } from "../../config/firebase-admin.config";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No Firebase ID token provided");
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      request.firebaseUser = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid Firebase ID token");
    }
  }
}
```

### 4. Create DTO

```typescript
// src/auth/dto/firebase-sync.dto.ts
import { IsOptional, IsString, IsUrl } from "class-validator";

export class FirebaseSyncDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsUrl()
  photoURL?: string;
}
```

### 5. Auth Controller Endpoint

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { FirebaseAuthGuard } from "./guards/firebase-auth.guard";
import { FirebaseSyncDto } from "./dto/firebase-sync.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("firebase/sync")
  @UseGuards(FirebaseAuthGuard)
  async firebaseSync(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: FirebaseSyncDto
  ) {
    const firebaseUser = req.firebaseUser;

    const result = await this.authService.syncFirebaseUser({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.email_verified,
      displayName: dto.displayName || firebaseUser.name,
      photoURL: dto.photoURL || firebaseUser.picture,
    });

    // Set HTTP-only cookie for web apps
    res.cookie("auth-token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return result;
  }
}
```

### 6. Auth Service Implementation

```typescript
// src/auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { getDiceBearAvatar } from "../utils/avatar";

interface FirebaseUserData {
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async syncFirebaseUser(data: FirebaseUserData) {
    // Parse name from displayName
    const nameParts = (data.displayName || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Generate username from email
    const username = data.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Upsert user - find by firebaseUid OR email
    const user = await this.prisma.user.upsert({
      where: {
        firebaseUid: data.firebaseUid,
      },
      update: {
        email: data.email,
        emailVerified: data.emailVerified,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        photoURL: data.photoURL || undefined,
        lastLoginAt: new Date(),
      },
      create: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        emailVerified: data.emailVerified,
        firstName,
        lastName,
        username,
        imageUrl: getDiceBearAvatar(username),
        photoURL: data.photoURL,
        role: "BUYER",
        provider: "GOOGLE",
      },
    });

    // Generate JWT with firebase_uid claim
    const payload = {
      sub: user.id,
      email: user.email,
      firebase_uid: user.firebaseUid,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: "refresh" },
      { expiresIn: "30d" }
    );

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }
}
```

### 7. Prisma Schema Update

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  firebaseUid   String?   @unique  // Add this field
  username      String?   @unique
  firstName     String?
  lastName      String?
  imageUrl      String?
  photoURL      String?              // Google profile photo
  role          Role      @default(BUYER)
  provider      Provider  @default(EMAIL)
  emailVerified Boolean   @default(false)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // ... other relations
}

enum Provider {
  EMAIL
  GOOGLE
  FIREBASE
}
```

### 8. Environment Variables

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=mash-ddf8d
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mash-ddf8d.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Testing

### cURL Test

```bash
# Get Firebase ID token from frontend console, then:
curl -X POST https://mash-backend-production.up.railway.app/api/v1/auth/firebase/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase-id-token>" \
  -d '{"displayName": "Test User", "photoURL": "https://example.com/photo.jpg"}'
```

### Frontend Console Test

```javascript
// In browser console after Google login:
const user = firebase.auth().currentUser;
const idToken = await user.getIdToken(true);

const response = await fetch(
  "https://mash-backend-production.up.railway.app/api/v1/auth/firebase/sync",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    credentials: "include",
    body: JSON.stringify({
      displayName: user.displayName,
      photoURL: user.photoURL,
    }),
  }
);

console.log(await response.json());
```

## Notes

1. **Security**: The backend NEVER trusts frontend-provided user data. All critical info (email, uid, email_verified) comes from the verified Firebase ID token.

2. **Graceful Degradation**: If backend sync fails, the frontend continues with Firebase-only authentication. The `firebase-auth` cookie still enables proxy route protection.

3. **Token Refresh**: The backend-issued JWT can be refreshed using the refresh token via the existing `/auth/refresh-token` endpoint.

4. **HTTP-only Cookie**: The `auth-token` cookie is set as HTTP-only for XSS protection. The frontend also has access to the token in the response for immediate use.
