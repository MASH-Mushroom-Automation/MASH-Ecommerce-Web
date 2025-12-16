/**
 * Tutorial Manager Component
 * 
 * Central hub for managing all tutorials and onboarding
 */

"use client";

import React, { useState, useEffect } from 'react';
import { OnboardingTour } from './OnboardingTour';
import { TutorialSequence, TutorialCategory } from '@/lib/types/onboarding';
import { OnboardingService } from '@/lib/services/onboarding.service';
import {
  ALL_TUTORIAL_SEQUENCES,
  GETTING_STARTED_TUTORIAL,
  getTutorialById,
} from '@/lib/config/tutorial-steps';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Play, 
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface TutorialManagerProps {
  userId: string;
  autoStart?: boolean;
  initialOpen?: boolean;
  onClose?: () => void;
}

export function TutorialManager({ userId, autoStart = true, initialOpen = false, onClose }: TutorialManagerProps) {
  const [showLibrary, setShowLibrary] = useState(initialOpen);
  const [currentSequence, setCurrentSequence] = useState<TutorialSequence | null>(null);
  const [progress, setProgress] = useState(OnboardingService.getProgress(userId));
  const [preferences, setPreferences] = useState(OnboardingService.getPreferences(userId));

  useEffect(() => {
    // Auto-start onboarding for new users
    if (autoStart && OnboardingService.shouldShowOnboarding(userId)) {
      setCurrentSequence(GETTING_STARTED_TUTORIAL);
    }
  }, [userId, autoStart]);

  useEffect(() => {
    // Update showLibrary when initialOpen changes
    setShowLibrary(initialOpen);
  }, [initialOpen]);

  const handleStartTutorial = (sequence: TutorialSequence) => {
    setCurrentSequence(sequence);
    setShowLibrary(false);
  };

  const handleCompleteTutorial = () => {
    setCurrentSequence(null);
    // Refresh progress
    setProgress(OnboardingService.getProgress(userId));
    
    // Check if all tutorials completed
    if (progress.completedSequences.length === ALL_TUTORIAL_SEQUENCES.length) {
      OnboardingService.completeOnboarding(userId);
      setPreferences(OnboardingService.getPreferences(userId));
    }
  };

  const handleSkipTutorial = () => {
    setCurrentSequence(null);
  };

  const isTutorialCompleted = (sequenceId: string) => {
    return progress.completedSequences.includes(sequenceId);
  };

  const getCategoryIcon = (category: TutorialCategory) => {
    const icons = {
      [TutorialCategory.GETTING_STARTED]: '🚀',
      [TutorialCategory.DASHBOARD]: '📊',
      [TutorialCategory.PRODUCTS]: '📦',
      [TutorialCategory.ORDERS]: '🛒',
      [TutorialCategory.SETTINGS]: '⚙️',
      [TutorialCategory.INVENTORY]: '📋',
      [TutorialCategory.ADDRESS]: '📍',
      [TutorialCategory.HANDOVER]: '🏪',
      [TutorialCategory.REFUND]: '💰',
    };
    return icons[category] || '📚';
  };

  return (
    <>
      {/* Active Tutorial */}
      {currentSequence && (
        <OnboardingTour
          userId={userId}
          sequence={currentSequence}
          onComplete={handleCompleteTutorial}
          onSkip={handleSkipTutorial}
        />
      )}

      {/* Tutorial Library Dialog */}
      <Dialog open={showLibrary} onOpenChange={(open) => {
        setShowLibrary(open);
        if (!open && onClose) onClose();
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tutorial Library
            </DialogTitle>
            <DialogDescription>
              Learn how to make the most of the MASH Seller Platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress Overview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Your Progress</CardTitle>
                  <Badge variant={progress.totalProgress === 100 ? 'default' : 'secondary'}>
                    {progress.totalProgress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progress.totalProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.completedSequences.length} of {ALL_TUTORIAL_SEQUENCES.length} tutorials completed
                </p>
              </CardContent>
            </Card>

            {/* Tutorial List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {ALL_TUTORIAL_SEQUENCES.map((sequence) => {
                  const isCompleted = isTutorialCompleted(sequence.id);
                  
                  return (
                    <Card key={sequence.id} className={isCompleted ? 'bg-green-50/50' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{getCategoryIcon(sequence.category)}</span>
                              <CardTitle className="text-base">{sequence.name}</CardTitle>
                              {sequence.isRequired && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm">
                              {sequence.description}
                            </CardDescription>
                          </div>
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(sequence.estimatedDuration / 60)}min
                            </span>
                            <span>{sequence.steps.length} steps</span>
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? 'outline' : 'default'}
                            onClick={() => handleStartTutorial(sequence)}
                          >
                            {isCompleted ? (
                              <>
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Replay
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowLibrary(false);
              if (onClose) onClose();
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export function to open library
export function useTutorialLibrary(userId: string) {
  const [showLibrary, setShowLibrary] = useState(false);

  return {
    showLibrary,
    openLibrary: () => setShowLibrary(true),
    closeLibrary: () => setShowLibrary(false),
    TutorialLibrary: () => (
      <TutorialManager userId={userId} autoStart={false} />
    ),
  };
}
