/**
 * Help Menu Component
 * 
 * Floating help button with tutorial access
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  HelpCircle, 
  BookOpen, 
  PlayCircle, 
  MessageCircle, 
  FileQuestion,
  Lightbulb,
} from 'lucide-react';
import { TutorialManager } from './TutorialManager';
import { Badge } from '@/components/ui/badge';
import { OnboardingService } from '@/lib/services/onboarding.service';

interface HelpMenuProps {
  userId: string;
  variant?: 'fixed' | 'inline';
}

export function HelpMenu({ userId, variant = 'fixed' }: HelpMenuProps) {
  const [showTutorials, setShowTutorials] = useState(false);
  const preferences = OnboardingService.getPreferences(userId);
  const progress = OnboardingService.getProgress(userId);

  const hasIncompleteTutorials = progress.totalProgress < 100;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === 'fixed' ? (
            <Button
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
              {hasIncompleteTutorials && (
                <Badge variant="destructive" className="h-5 px-1 text-xs">
                  {100 - progress.totalProgress}%
                </Badge>
              )}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Get Help</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowTutorials(true)}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Tutorial Library</span>
            {hasIncompleteTutorials && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {progress.completedSequences.length}/{progress.completedSequences.length + (100 - progress.totalProgress) / 20}
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => {
            // Start getting started tutorial
            const gettingStarted = document.querySelector('[data-tour-trigger="getting-started"]');
            if (gettingStarted) (gettingStarted as HTMLElement).click();
          }}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Quick Start Guide</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => {
            window.open('/help/faq', '_blank');
          }}>
            <FileQuestion className="mr-2 h-4 w-4" />
            <span>FAQ</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => {
            window.open('/help/contact', '_blank');
          }}>
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Contact Support</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => {
            window.open('/help/tips', '_blank');
          }}>
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>Seller Tips</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tutorial Manager */}
      {showTutorials && (
        <TutorialManager 
          userId={userId} 
          autoStart={false}
        />
      )}
    </>
  );
}
