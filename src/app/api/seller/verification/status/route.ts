import { NextRequest, NextResponse } from 'next/server';
import { VerificationSubmission, VerificationStatus, DocumentStatus } from '@/lib/types/verification';

/**
 * GET /api/seller/verification/status
 * Get current verification status for the authenticated seller
 * Issue #90 - Status tracking API
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated seller from session/token
    const sellerId = 'demo-seller-123';

    // TODO: Fetch from database
    // const submission = await prisma.verificationSubmission.findFirst({
    //   where: { sellerId },
    //   include: {
    //     documents: true,
    //     reviewHistory: {
    //       include: { reviewer: true },
    //       orderBy: { createdAt: 'desc' }
    //     }
    //   },
    //   orderBy: { submittedAt: 'desc' }
    // });

    // MOCK DATA - Replace with actual database query
    const mockSubmission: VerificationSubmission = {
      id: 'sub-123',
      sellerId: sellerId,
      status: VerificationStatus.PENDING,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      documents: [
        {
          id: 'doc-1',
          documentId: 'business_permit_abc123',
          documentType: 'business_permit',
          filename: 'business-permit.pdf',
          fileUrl: 'https://storage.example.com/documents/business-permit.pdf',
          status: DocumentStatus.PENDING,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'doc-2',
          documentId: 'valid_id_xyz789',
          documentType: 'valid_id',
          filename: 'valid-id.jpg',
          fileUrl: 'https://storage.example.com/documents/valid-id.jpg',
          status: DocumentStatus.PENDING,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
      reviewHistory: [],
      resubmissionCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: mockSubmission,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/seller/verification/status
 * Update verification status (for optimistic UI updates)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, feedback } = body;

    // TODO: Validate seller authentication
    const sellerId = 'demo-seller-123';

    // TODO: Update database
    // const updated = await prisma.verificationSubmission.update({
    //   where: { id: body.submissionId },
    //   data: {
    //     status,
    //     currentFeedback: feedback,
    //     reviewedAt: new Date(),
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
