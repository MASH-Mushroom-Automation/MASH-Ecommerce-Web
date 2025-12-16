import { NextRequest, NextResponse } from 'next/server';
import { AdminReviewRequest, VerificationStatus, DocumentStatus, ReviewAction } from '@/lib/types/verification';

/**
 * POST /api/admin/verification/review
 * Admin endpoint to review and approve/reject seller verification
 * Issue #90 - Admin review workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body: AdminReviewRequest = await request.json();
    const { submissionId, action, feedback, documentReviews } = body;

    // TODO: Validate admin authentication and permissions
    const adminId = 'admin-123';
    const adminName = 'Admin User';
    const adminEmail = 'admin@mash.com';

    // Validate request
    if (!submissionId || !action || !feedback) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine new status based on action
    let newStatus: VerificationStatus;
    switch (action) {
      case ReviewAction.APPROVE:
        newStatus = VerificationStatus.APPROVED;
        break;
      case ReviewAction.REJECT:
        newStatus = VerificationStatus.REJECTED;
        break;
      case ReviewAction.REQUEST_CHANGES:
        newStatus = VerificationStatus.REJECTED;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // TODO: Update database in a transaction
    // const result = await prisma.$transaction(async (tx) => {
    //   // Update submission status
    //   const submission = await tx.verificationSubmission.update({
    //     where: { id: submissionId },
    //     data: {
    //       status: newStatus,
    //       reviewedAt: new Date(),
    //       ...(newStatus === VerificationStatus.APPROVED && { approvedAt: new Date() }),
    //       ...(newStatus === VerificationStatus.REJECTED && { 
    //         rejectedAt: new Date(),
    //         currentFeedback: {
    //           message: feedback,
    //           requiredActions: extractRequiredActions(feedback),
    //           documentIssues: documentReviews?.map(dr => ({
    //             documentType: dr.documentType,
    //             issue: dr.rejectionReason || ''
    //           })) || []
    //         }
    //       }),
    //     },
    //     include: { seller: true }
    //   });
    //
    //   // Update document statuses
    //   if (documentReviews && documentReviews.length > 0) {
    //     for (const docReview of documentReviews) {
    //       await tx.verificationDocument.update({
    //         where: { id: docReview.documentId },
    //         data: {
    //           status: docReview.status,
    //           rejectionReason: docReview.rejectionReason,
    //           reviewedAt: new Date(),
    //           reviewedBy: adminId,
    //         }
    //       });
    //     }
    //   }
    //
    //   // Create review history entry
    //   await tx.verificationReviewHistory.create({
    //     data: {
    //       submissionId,
    //       action,
    //       reviewerId: adminId,
    //       feedback,
    //       documents: documentReviews?.map(dr => ({
    //         documentType: dr.documentType,
    //         action: dr.status === DocumentStatus.APPROVED ? ReviewAction.APPROVE : ReviewAction.REJECT,
    //         reason: dr.rejectionReason
    //       }))
    //     }
    //   });
    //
    //   return submission;
    // });

    // TODO: Trigger webhook for status change
    // await triggerWebhook('verification.reviewed', {
    //   submissionId,
    //   sellerId: result.sellerId,
    //   action,
    //   newStatus,
    // });

    // TODO: Send email notification
    // await sendNotificationEmail({
    //   type: newStatus === VerificationStatus.APPROVED 
    //     ? NotificationType.APPROVED 
    //     : NotificationType.REJECTED,
    //   sellerId: result.sellerId,
    //   sellerEmail: result.seller.email,
    //   sellerName: result.seller.name,
    //   submissionId,
    //   metadata: {
    //     feedback,
    //     reviewerName: adminName,
    //     ...(newStatus === VerificationStatus.APPROVED && { 
    //       approvalDate: new Date() 
    //     })
    //   }
    // });

    // MOCK RESPONSE
    return NextResponse.json({
      success: true,
      message: `Application ${action === ReviewAction.APPROVE ? 'approved' : 'reviewed'} successfully`,
      data: {
        submissionId,
        newStatus,
        reviewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error reviewing verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/verification/review
 * Get list of pending verification submissions for admin review
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || VerificationStatus.PENDING;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // TODO: Validate admin authentication

    // TODO: Fetch from database
    // const [submissions, total] = await Promise.all([
    //   prisma.verificationSubmission.findMany({
    //     where: { status },
    //     include: {
    //       seller: true,
    //       documents: true,
    //       reviewHistory: {
    //         include: { reviewer: true },
    //         orderBy: { createdAt: 'desc' },
    //         take: 1
    //       }
    //     },
    //     orderBy: { submittedAt: 'asc' },
    //     skip,
    //     take: limit,
    //   }),
    //   prisma.verificationSubmission.count({ where: { status } })
    // ]);

    // MOCK DATA
    const mockSubmissions = [
      {
        id: 'sub-1',
        sellerId: 'seller-1',
        seller: {
          id: 'seller-1',
          name: 'John Doe Mushroom Farm',
          email: 'john@example.com',
        },
        status: VerificationStatus.PENDING,
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        documents: [
          {
            documentType: 'business_permit',
            filename: 'permit.pdf',
            status: DocumentStatus.PENDING,
          },
        ],
        reviewHistory: [],
        resubmissionCount: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        submissions: mockSubmissions,
        pagination: {
          page,
          limit,
          total: 1,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// Helper function to extract action items from feedback
function extractRequiredActions(feedback: string): string[] {
  // Simple extraction - look for numbered lists or bullet points
  const lines = feedback.split('\n');
  const actions: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered lists (1., 2., etc.) or bullet points (-, *, •)
    if (/^(\d+\.|[-*•])\s+/.test(trimmed)) {
      actions.push(trimmed.replace(/^(\d+\.|[-*•])\s+/, ''));
    }
  }
  
  return actions.length > 0 ? actions : [feedback];
}
