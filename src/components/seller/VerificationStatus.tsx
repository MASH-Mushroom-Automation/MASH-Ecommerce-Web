'use client';

/**
 * VerificationStatus Component
 * Issue #90 - Business Verification Status Tracking
 * 
 * Displays current verification status with timeline and progress
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  VerificationStatus as Status, 
  VerificationSubmission, 
  VERIFICATION_STATUS_CONFIG 
} from '@/lib/types/verification';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface VerificationStatusProps {
  submission: VerificationSubmission;
  onResubmit?: () => void;
  onViewHistory?: () => void;
}

const StatusIcon = {
  clock: Clock,
  eye: Eye,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  refresh: RefreshCw,
};

export function VerificationStatus({ 
  submission, 
  onResubmit, 
  onViewHistory 
}: VerificationStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState<string>('');
  const config = VERIFICATION_STATUS_CONFIG[submission.status];
  const Icon = StatusIcon[config.icon as keyof typeof StatusIcon];

  // Calculate time elapsed since submission
  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const submitted = new Date(submission.submittedAt);
      const diffMs = now.getTime() - submitted.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        setTimeElapsed(`${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
      } else if (diffHours > 0) {
        setTimeElapsed(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      } else {
        setTimeElapsed('Just now');
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [submission.submittedAt]);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    switch (submission.status) {
      case Status.PENDING:
        return 25;
      case Status.UNDER_REVIEW:
        return 50;
      case Status.RESUBMITTED:
        return 40;
      case Status.APPROVED:
        return 100;
      case Status.REJECTED:
        return 75;
      default:
        return 0;
    }
  };

  // Get color classes based on status
  const getColorClasses = () => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[config.color as keyof typeof colors] || colors.yellow;
  };

  // Get badge variant
  const getBadgeVariant = () => {
    switch (submission.status) {
      case Status.APPROVED:
        return 'default';
      case Status.REJECTED:
        return 'destructive';
      case Status.UNDER_REVIEW:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 text-${config.color}-600`} />
                Verification Status
              </CardTitle>
              <CardDescription>
                Track your seller account verification progress
              </CardDescription>
            </div>
            <Badge variant={getBadgeVariant()}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Status Message */}
          <Alert className={getColorClasses()}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">{config.label}</p>
              <p className="text-sm">{config.description}</p>
            </AlertDescription>
          </Alert>

          {/* Timeline Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">{timeElapsed}</p>
              </div>
            </div>

            {submission.reviewedAt && (
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reviewed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(submission.reviewedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {submission.approvedAt && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Approved</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(submission.approvedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {submission.resubmissionCount > 0 && (
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Resubmissions</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.resubmissionCount} time{submission.resubmissionCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Feedback - Only show if rejected */}
          {submission.status === Status.REJECTED && submission.currentFeedback && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-red-900">Admin Feedback</p>
                    <p className="text-sm text-red-800 mt-1">
                      {submission.currentFeedback.message}
                    </p>
                  </div>

                  {submission.currentFeedback.requiredActions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-2">Required Actions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                        {submission.currentFeedback.requiredActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submission.currentFeedback.documentIssues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-2">Document Issues:</p>
                      <ul className="space-y-2">
                        {submission.currentFeedback.documentIssues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{issue.documentType}:</span>{' '}
                              {issue.issue}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {submission.status === Status.REJECTED && onResubmit && (
              <Button onClick={onResubmit} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Resubmit Application
              </Button>
            )}
            
            {submission.reviewHistory.length > 0 && onViewHistory && (
              <Button variant="outline" onClick={onViewHistory}>
                View Review History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Status</CardTitle>
          <CardDescription>
            Review the status of each submitted document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submission.documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {doc.documentType.replace(/_/g, ' ')}
                    </p>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">{doc.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    doc.status === 'approved' ? 'default' :
                    doc.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }
                  className="ml-2"
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
