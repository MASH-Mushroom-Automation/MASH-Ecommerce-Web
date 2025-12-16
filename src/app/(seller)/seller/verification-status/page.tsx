'use client';

/**
 * Verification Status Page with Resubmission
 * Issue #90 - Track verification status and handle resubmission
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerificationStatus } from '@/components/seller/VerificationStatus';
import { ReviewHistory } from '@/components/seller/ReviewHistory';
import { VerificationSubmission, VerificationStatus as Status } from '@/lib/types/verification';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function VerificationStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submission, setSubmission] = useState<VerificationSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/verification/status');
      const data = await response.json();

      if (data.success && data.data) {
        setSubmission(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = () => {
    if (submission) {
      router.push(`/seller/verify-documents?resubmit=${submission.id}`);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Verification Found</h1>
          <p className="text-muted-foreground">
            You haven't submitted a verification application yet.
          </p>
          <Button onClick={() => router.push('/seller/verify-documents')}>
            Start Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Verification Status</h1>
          <p className="text-muted-foreground mt-2">
            Track your seller account verification progress
          </p>
        </div>

        {/* Status Display */}
        <VerificationStatus
          submission={submission}
          onResubmit={handleResubmit}
          onViewHistory={() => setShowHistory(true)}
        />

        {/* Review History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review History</DialogTitle>
              <DialogDescription>
                Complete timeline of all reviews and feedback
              </DialogDescription>
            </DialogHeader>
            <ReviewHistory history={submission.reviewHistory} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
