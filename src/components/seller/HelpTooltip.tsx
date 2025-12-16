/**
 * HelpTooltip Component
 * 
 * Context-sensitive help tooltips that appear on hover/click
 */

"use client";

import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { HelpTooltip as HelpTooltipType } from '@/lib/types/onboarding';
import { OnboardingService } from '@/lib/services/onboarding.service';

interface HelpTooltipProps {
  tooltip: HelpTooltipType;
  userId: string;
  children?: React.ReactNode;
  asButton?: boolean;
}

export function HelpTooltip({ tooltip, userId, children, asButton = false }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if tooltip was dismissed
    if (tooltip.showOnce) {
      const isDismissed = OnboardingService.isTooltipDismissed(userId, tooltip.id);
      setIsVisible(!isDismissed);
    }
  }, [tooltip, userId]);

  const handleDismiss = () => {
    if (tooltip.isDismissible) {
      setIsVisible(false);
      OnboardingService.dismissTooltip(userId, tooltip.id);
    }
  };

  if (!isVisible) return null;

  const tooltipContent = (
    <TooltipContent 
      side={tooltip.placement || 'top'}
      className="max-w-xs p-4"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{tooltip.title}</h4>
          {tooltip.isDismissible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{tooltip.content}</p>
      </div>
    </TooltipContent>
  );

  if (asButton) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />}
        </TooltipTrigger>
        {tooltipContent}
      </Tooltip>
    </TooltipProvider>
  );
}
