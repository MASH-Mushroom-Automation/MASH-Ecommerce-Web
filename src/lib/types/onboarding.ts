/**
 * Onboarding Tutorial System Types
 * 
 * Comprehensive type definitions for the seller onboarding tutorial system
 */

import { Step } from 'react-joyride';

// Tutorial step with extended properties
export interface TutorialStep extends Step {
  id: string;
  category: TutorialCategory;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  isOptional?: boolean;
}

// Tutorial categories
export enum TutorialCategory {
  DASHBOARD = 'dashboard',
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  ORDERS = 'orders',
  ADDRESS = 'address',
  HANDOVER = 'handover',
  REFUND = 'refund',
  SETTINGS = 'settings',
  GETTING_STARTED = 'getting_started',
}

// Tutorial sequence
export interface TutorialSequence {
  id: string;
  name: string;
  description: string;
  category: TutorialCategory;
  steps: TutorialStep[];
  isRequired: boolean;
  estimatedDuration: number; // in seconds
  prerequisites?: string[]; // IDs of sequences that must be completed first
}

// Progress tracking
export interface TutorialProgress {
  userId: string;
  completedSequences: string[]; // Sequence IDs
  completedSteps: string[]; // Step IDs
  skippedSequences: string[]; // Sequence IDs
  currentSequence?: string;
  currentStepIndex: number;
  lastUpdated: string; // ISO date
  totalProgress: number; // 0-100
}

// User preferences
export interface OnboardingPreferences {
  userId: string;
  hasCompletedOnboarding: boolean;
  showTutorials: boolean;
  autoStartTutorials: boolean;
  showTooltips: boolean;
  dismissedTooltips: string[]; // Tooltip IDs
  completedAt?: string; // ISO date
  skippedAt?: string; // ISO date
}

// Help tooltip
export interface HelpTooltip {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  category: TutorialCategory;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  triggerOn?: 'hover' | 'click' | 'focus';
  isDismissible: boolean;
  showOnce?: boolean;
  priority: number; // 1 (low) to 5 (high)
}

// Context-sensitive help
export interface ContextualHelp {
  id: string;
  route: string; // Page route
  triggers: HelpTrigger[];
  tooltips: HelpTooltip[];
}

export interface HelpTrigger {
  id: string;
  event: 'pageLoad' | 'userAction' | 'error' | 'idle' | 'custom';
  condition?: () => boolean;
  action: () => void;
}

// Onboarding state
export interface OnboardingState {
  isActive: boolean;
  currentSequence?: TutorialSequence;
  currentStepIndex: number;
  progress: TutorialProgress;
  preferences: OnboardingPreferences;
  showCelebration: boolean;
}

// Analytics events
export interface OnboardingEvent {
  eventType: 'start' | 'complete' | 'skip' | 'step_complete' | 'step_skip' | 'error';
  sequenceId?: string;
  stepId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Constants
export const ONBOARDING_STORAGE_KEY = 'mash_seller_onboarding';
export const TUTORIAL_PROGRESS_KEY = 'mash_tutorial_progress';
export const ONBOARDING_PREFERENCES_KEY = 'mash_onboarding_preferences';

// Default values
export const DEFAULT_TUTORIAL_PROGRESS: TutorialProgress = {
  userId: '',
  completedSequences: [],
  completedSteps: [],
  skippedSequences: [],
  currentStepIndex: 0,
  lastUpdated: new Date().toISOString(),
  totalProgress: 0,
};

export const DEFAULT_ONBOARDING_PREFERENCES: OnboardingPreferences = {
  userId: '',
  hasCompletedOnboarding: false,
  showTutorials: true,
  autoStartTutorials: true,
  showTooltips: true,
  dismissedTooltips: [],
};
