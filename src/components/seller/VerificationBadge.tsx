'use client';

/**
 * VerificationBadge Component
 * Issue #90 - Display verification status badge
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { VerificationStatus } from '@/lib/types/verification';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const BadgeConfig = {
  [VerificationStatus.PENDING]: {
    label: 'Pending',
    icon: Clock,
    variant: 'outline' as const,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    tooltip: 'Verification pending',
  },
  [VerificationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    icon: AlertCircle,
    variant: 'secondary' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tooltip: 'Application under review',
  },
  [VerificationStatus.APPROVED]: {
    label: 'Verified',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tooltip: 'Verified seller',
  },
  [VerificationStatus.REJECTED]: {
    label: 'Rejected',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    tooltip: 'Verification rejected',
  },
  [VerificationStatus.RESUBMITTED]: {
    label: 'Resubmitted',
    icon: Clock,
    variant: 'outline' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tooltip: 'Resubmission pending review',
  },
};

const SizeConfig = {
  sm: {
    iconSize: 'h-3 w-3',
    text: 'text-xs',
    padding: 'px-2 py-0.5',
  },
  md: {
    iconSize: 'h-4 w-4',
    text: 'text-sm',
    padding: 'px-3 py-1',
  },
  lg: {
    iconSize: 'h-5 w-5',
    text: 'text-base',
    padding: 'px-4 py-1.5',
  },
};

export function VerificationBadge({ 
  status, 
  size = 'md',
  showTooltip = true,
  className = ''
}: VerificationBadgeProps) {
  const config = BadgeConfig[status];
  const sizeConfig = SizeConfig[size];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1.5 ${sizeConfig.padding} ${className}`}
    >
      <Icon className={sizeConfig.iconSize} />
      <span className={sizeConfig.text}>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Mini Verification Badge - For use in lists, cards, avatars
 */
interface MiniVerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export function MiniVerificationBadge({ status, className = '' }: MiniVerificationBadgeProps) {
  const config = BadgeConfig[status];
  const Icon = config.icon;

  // Only show for approved status in mini version
  if (status !== VerificationStatus.APPROVED) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center justify-center rounded-full ${config.bgColor} p-1 ${className}`}
          >
            <Icon className={`h-3 w-3 ${config.color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
