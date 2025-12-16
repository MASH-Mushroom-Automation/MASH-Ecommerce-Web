/**
 * Verification Status Types and Constants
 * Issue #90 - Seller Profile Setup Wizard
 */

export enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMITTED = 'resubmitted',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  REQUEST_CHANGES = 'request_changes',
}

export interface VerificationDocument {
  id: string;
  documentId: string;
  documentType: string;
  filename: string;
  fileUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface VerificationReviewHistory {
  id: string;
  action: ReviewAction;
  reviewer: {
    id: string;
    name: string;
    email: string;
  };
  feedback: string;
  documents?: {
    documentType: string;
    action: ReviewAction;
    reason?: string;
  }[];
  createdAt: Date;
}

export interface VerificationSubmission {
  id: string;
  sellerId: string;
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  documents: VerificationDocument[];
  reviewHistory: VerificationReviewHistory[];
  currentFeedback?: {
    message: string;
    requiredActions: string[];
    documentIssues: {
      documentType: string;
      issue: string;
    }[];
  };
  resubmissionCount: number;
  lastResubmittedAt?: Date;
}

export interface AdminReviewRequest {
  submissionId: string;
  action: ReviewAction;
  feedback: string;
  documentReviews?: {
    documentId: string;
    status: DocumentStatus;
    rejectionReason?: string;
  }[];
}

export interface VerificationStats {
  totalSubmissions: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number; // in hours
  resubmissionRate: number; // percentage
}

// Status display configurations
export const VERIFICATION_STATUS_CONFIG = {
  [VerificationStatus.PENDING]: {
    label: 'Pending Review',
    description: 'Your application is waiting to be reviewed',
    color: 'yellow',
    icon: 'clock',
  },
  [VerificationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    description: 'Your application is currently being reviewed',
    color: 'blue',
    icon: 'eye',
  },
  [VerificationStatus.APPROVED]: {
    label: 'Approved',
    description: 'Your application has been approved',
    color: 'green',
    icon: 'check-circle',
  },
  [VerificationStatus.REJECTED]: {
    label: 'Rejected',
    description: 'Your application needs changes',
    color: 'red',
    icon: 'x-circle',
  },
  [VerificationStatus.RESUBMITTED]: {
    label: 'Resubmitted',
    description: 'Your updated application is pending review',
    color: 'purple',
    icon: 'refresh',
  },
} as const;

// Email notification types
export enum NotificationType {
  SUBMISSION_RECEIVED = 'submission_received',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMISSION_RECEIVED = 'resubmission_received',
  REMINDER = 'reminder',
}

export interface NotificationPayload {
  type: NotificationType;
  sellerId: string;
  sellerEmail: string;
  sellerName: string;
  submissionId: string;
  metadata?: {
    feedback?: string;
    requiredActions?: string[];
    approvalDate?: Date;
    reviewerName?: string;
  };
}
