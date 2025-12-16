'use client';

/**
 * ReviewHistory Component
 * Issue #90 - Display verification review timeline and feedback
 */

import { VerificationReviewHistory, ReviewAction } from '@/lib/types/verification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewHistoryProps {
  history: VerificationReviewHistory[];
}

const ActionIcon = {
  [ReviewAction.APPROVE]: CheckCircle,
  [ReviewAction.REJECT]: XCircle,
  [ReviewAction.REQUEST_CHANGES]: AlertCircle,
};

const ActionConfig = {
  [ReviewAction.APPROVE]: {
    label: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    variant: 'default' as const,
  },
  [ReviewAction.REJECT]: {
    label: 'Rejected',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    variant: 'destructive' as const,
  },
  [ReviewAction.REQUEST_CHANGES]: {
    label: 'Changes Requested',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    variant: 'outline' as const,
  },
};

export function ReviewHistory({ history }: ReviewHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No review history available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((review, idx) => {
            const config = ActionConfig[review.action];
            const Icon = ActionIcon[review.action];
            const initials = review.reviewer.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase();

            return (
              <div key={review.id} className="relative">
                {/* Timeline connector */}
                {idx < history.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Avatar with status icon */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 rounded-full ${config.bgColor} p-1`}>
                      <Icon className={`h-3 w-3 ${config.color}`} />
                    </div>
                  </div>

                  {/* Review content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{review.reviewer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy - hh:mm a')}
                        </p>
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>

                    {/* Feedback message */}
                    {review.feedback && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm">{review.feedback}</p>
                      </div>
                    )}

                    {/* Document-specific feedback */}
                    {review.documents && review.documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Document Reviews:</p>
                        <div className="space-y-2">
                          {review.documents.map((doc, docIdx) => {
                            const docConfig = ActionConfig[doc.action];
                            return (
                              <div
                                key={docIdx}
                                className="flex items-start gap-2 text-sm bg-background border rounded-lg p-3"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium capitalize">
                                      {doc.documentType.replace(/_/g, ' ')}
                                    </span>
                                    <Badge variant={docConfig.variant} className="text-xs">
                                      {docConfig.label}
                                    </Badge>
                                  </div>
                                  {doc.reason && (
                                    <p className="text-muted-foreground">{doc.reason}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
