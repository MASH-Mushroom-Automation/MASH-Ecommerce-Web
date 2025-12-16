/**
 * Onboarding Progress Persistence Service
 * 
 * Manages saving and retrieving tutorial progress from localStorage
 */

import {
  TutorialProgress,
  OnboardingPreferences,
  DEFAULT_TUTORIAL_PROGRESS,
  DEFAULT_ONBOARDING_PREFERENCES,
  TUTORIAL_PROGRESS_KEY,
  ONBOARDING_PREFERENCES_KEY,
  OnboardingEvent,
} from '@/lib/types/onboarding';

export class OnboardingService {
  // Progress Management
  static getProgress(userId: string): TutorialProgress {
    if (typeof window === 'undefined') return { ...DEFAULT_TUTORIAL_PROGRESS, userId };

    try {
      const stored = localStorage.getItem(TUTORIAL_PROGRESS_KEY);
      if (!stored) return { ...DEFAULT_TUTORIAL_PROGRESS, userId };

      const progress: TutorialProgress = JSON.parse(stored);
      
      // Ensure it's for the current user
      if (progress.userId !== userId) {
        return { ...DEFAULT_TUTORIAL_PROGRESS, userId };
      }

      return progress;
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
      return { ...DEFAULT_TUTORIAL_PROGRESS, userId };
    }
  }

  static saveProgress(progress: TutorialProgress): void {
    if (typeof window === 'undefined') return;

    try {
      progress.lastUpdated = new Date().toISOString();
      localStorage.setItem(TUTORIAL_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving tutorial progress:', error);
    }
  }

  static completeStep(userId: string, stepId: string): void {
    const progress = this.getProgress(userId);
    
    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
      this.saveProgress(progress);
    }
  }

  static completeSequence(userId: string, sequenceId: string): void {
    const progress = this.getProgress(userId);
    
    if (!progress.completedSequences.includes(sequenceId)) {
      progress.completedSequences.push(sequenceId);
      progress.totalProgress = this.calculateTotalProgress(progress);
      this.saveProgress(progress);
    }
  }

  static skipSequence(userId: string, sequenceId: string): void {
    const progress = this.getProgress(userId);
    
    if (!progress.skippedSequences.includes(sequenceId)) {
      progress.skippedSequences.push(sequenceId);
      this.saveProgress(progress);
    }
  }

  static setCurrentSequence(userId: string, sequenceId: string, stepIndex: number = 0): void {
    const progress = this.getProgress(userId);
    progress.currentSequence = sequenceId;
    progress.currentStepIndex = stepIndex;
    this.saveProgress(progress);
  }

  static clearProgress(userId: string): void {
    const progress = { ...DEFAULT_TUTORIAL_PROGRESS, userId };
    this.saveProgress(progress);
  }

  // Preferences Management
  static getPreferences(userId: string): OnboardingPreferences {
    if (typeof window === 'undefined') return { ...DEFAULT_ONBOARDING_PREFERENCES, userId };

    try {
      const stored = localStorage.getItem(ONBOARDING_PREFERENCES_KEY);
      if (!stored) return { ...DEFAULT_ONBOARDING_PREFERENCES, userId };

      const preferences: OnboardingPreferences = JSON.parse(stored);
      
      // Ensure it's for the current user
      if (preferences.userId !== userId) {
        return { ...DEFAULT_ONBOARDING_PREFERENCES, userId };
      }

      return preferences;
    } catch (error) {
      console.error('Error loading onboarding preferences:', error);
      return { ...DEFAULT_ONBOARDING_PREFERENCES, userId };
    }
  }

  static savePreferences(preferences: OnboardingPreferences): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ONBOARDING_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
    }
  }

  static updatePreference<K extends keyof OnboardingPreferences>(
    userId: string,
    key: K,
    value: OnboardingPreferences[K]
  ): void {
    const preferences = this.getPreferences(userId);
    preferences[key] = value;
    this.savePreferences(preferences);
  }

  static dismissTooltip(userId: string, tooltipId: string): void {
    const preferences = this.getPreferences(userId);
    if (!preferences.dismissedTooltips.includes(tooltipId)) {
      preferences.dismissedTooltips.push(tooltipId);
      this.savePreferences(preferences);
    }
  }

  static isTooltipDismissed(userId: string, tooltipId: string): boolean {
    const preferences = this.getPreferences(userId);
    return preferences.dismissedTooltips.includes(tooltipId);
  }

  static completeOnboarding(userId: string): void {
    const preferences = this.getPreferences(userId);
    preferences.hasCompletedOnboarding = true;
    preferences.completedAt = new Date().toISOString();
    this.savePreferences(preferences);
  }

  static skipOnboarding(userId: string): void {
    const preferences = this.getPreferences(userId);
    preferences.hasCompletedOnboarding = true;
    preferences.skippedAt = new Date().toISOString();
    this.savePreferences(preferences);
  }

  // Utility Functions
  static calculateTotalProgress(progress: TutorialProgress): number {
    // Calculate based on completed sequences
    // Assuming we have 5 total sequences
    const totalSequences = 5;
    const completedCount = progress.completedSequences.length;
    return Math.round((completedCount / totalSequences) * 100);
  }

  static shouldShowOnboarding(userId: string): boolean {
    const preferences = this.getPreferences(userId);
    const progress = this.getProgress(userId);
    
    return (
      !preferences.hasCompletedOnboarding &&
      preferences.showTutorials &&
      progress.completedSequences.length === 0
    );
  }

  static canResumeOnboarding(userId: string): boolean {
    const progress = this.getProgress(userId);
    return progress.currentSequence !== undefined && progress.currentSequence !== null;
  }

  // Analytics
  static trackEvent(event: OnboardingEvent): void {
    if (typeof window === 'undefined') return;

    try {
      // Store in session storage for analytics
      const events = JSON.parse(sessionStorage.getItem('onboarding_events') || '[]');
      events.push(event);
      sessionStorage.setItem('onboarding_events', JSON.stringify(events));

      // Log for debugging
      console.log('[Onboarding]', event.eventType, event);
    } catch (error) {
      console.error('Error tracking onboarding event:', error);
    }
  }

  static getAnalytics(): OnboardingEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(sessionStorage.getItem('onboarding_events') || '[]');
    } catch (error) {
      console.error('Error loading analytics:', error);
      return [];
    }
  }

  static clearAnalytics(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('onboarding_events');
  }
}
