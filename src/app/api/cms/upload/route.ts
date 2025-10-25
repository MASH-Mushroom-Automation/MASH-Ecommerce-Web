// File Upload API for CMS
// src/app/api/cms/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { CMS_CONFIG, generateId } from '@/lib/cms/config';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = CMS_CONFIG.ALLOWED_FILE_TYPES.map(type => `image/${type}`);
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `File type not allowed. Allowed types: ${CMS_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > CMS_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File size too large. Maximum size: ${CMS_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${generateId()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', CMS_CONFIG.UPLOAD_PATH);
    const filePath = join(uploadDir, filename);

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      data: {
        filename,
        url: `${CMS_CONFIG.UPLOAD_PATH}/${filename}`,
        size: file.size,
        type: file.type
      },
      success: true,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file'
    }, { status: 500 });
  }
}
