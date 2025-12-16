/**
 * OnboardingTour Component
 * 
 * Main interactive tutorial component using React Joyride
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS, Step } from 'react-joyride';
import { TutorialSequence, OnboardingEvent } from '@/lib/types/onboarding';
import { OnboardingService } from '@/lib/services/onboarding.service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, PartyPopper, Trophy, Sparkles } from 'lucide-react';

interface OnboardingTourProps {
  userId: string;
  sequence: TutorialSequence;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export function OnboardingTour({
  userId,
  sequence,
  onComplete,
  onSkip,
  autoStart = true,
}: OnboardingTourProps) {
  const [run, setRun] = useState(autoStart);
  const [stepIndex, setStepIndex] = useState(0);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Track progress
  const progress = (stepIndex / sequence.steps.length) * 100;

  // Handle tour callback
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, action, index } = data;

      const trackEvent = (eventType: OnboardingEvent['eventType']) => {
        OnboardingService.trackEvent({
          eventType,
          sequenceId: sequence.id,
          stepId: sequence.steps[index]?.id,
          timestamp: new Date().toISOString(),
          metadata: { status, type, action, index },
        });
      };

      if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
        if (status === STATUS.FINISHED) {
          // Tutorial completed
          OnboardingService.completeSequence(userId, sequence.id);
          trackEvent('complete');
          triggerCelebration();
          setShowCelebration(true);
          onComplete?.();
        } else if (status === STATUS.SKIPPED) {
          // Tutorial skipped
          OnboardingService.skipSequence(userId, sequence.id);
          trackEvent('skip');
          onSkip?.();
        }
        setRun(false);
      } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
        const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        
        if (action !== ACTIONS.CLOSE) {
          setStepIndex(nextStepIndex);
          
          // Save progress
          OnboardingService.setCurrentSequence(userId, sequence.id, nextStepIndex);
          
          // Track step completion
          if (action === ACTIONS.NEXT) {
            const currentStep = sequence.steps[index];
            OnboardingService.completeStep(userId, currentStep.id);
            trackEvent('step_complete');
          }
        }
      } else if (type === EVENTS.TOUR_START) {
        trackEvent('start');
      }
    },
    [userId, sequence, onComplete, onSkip, stepIndex]
  );

  // Trigger celebration effect
  const triggerCelebration = async () => {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Handle skip with confirmation
  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const confirmSkip = () => {
    setShowSkipDialog(false);
    setRun(false);
    OnboardingService.skipSequence(userId, sequence.id);
    onSkip?.();
  };

  return (
    <>
      <Joyride
        steps={sequence.steps as Step[]}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        scrollOffset={100}
        disableOverlayClose
        spotlightClicks
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipContent: {
            padding: '10px 0',
          },
          buttonNext: {
            backgroundColor: '#2563eb',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: '14px',
          },
          buttonBack: {
            color: '#6b7280',
            marginRight: 10,
          },
          buttonSkip: {
            color: '#ef4444',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          open: 'Open',
          skip: 'Skip Tutorial',
        }}
      />

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip This Tutorial?</DialogTitle>
            <DialogDescription>
              Are you sure you want to skip "{sequence.name}"? 
              <br />
              <br />
              You can always restart tutorials from the Help menu later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              Continue Tutorial
            </Button>
            <Button variant="destructive" onClick={confirmSkip}>
              Yes, Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4 relative">
              <Trophy className="h-20 w-20 text-yellow-500" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl">
                <PartyPopper className="inline h-6 w-6 mr-2" />
                Tutorial Complete!
              </DialogTitle>
              <DialogDescription className="text-base">
                Great job completing <strong>"{sequence.name}"</strong>!
                <br />
                <br />
                You're now ready to use this feature like a pro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 w-full space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <p className="font-semibold text-blue-900 mb-2">🎯 Next Steps:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Try out what you've learned</li>
                  <li>Explore more tutorials in the Help menu</li>
                  <li>Contact support if you need assistance</li>
                </ul>
              </div>

              <Progress value={100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Tutorial Progress: 100%
              </p>
            </div>

            <DialogFooter className="mt-6 w-full">
              <Button 
                className="w-full" 
                onClick={() => setShowCelebration(false)}
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
