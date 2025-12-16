# Onboarding Tutorial System - Quick Reference

## Quick Start

### Add Tutorial to Any Page

```tsx
import { TutorialManager } from '@/components/seller/TutorialManager';
import { HelpMenu } from '@/components/seller/HelpMenu';

export default function MyPage() {
  return (
    <>
      <TutorialManager userId="seller-123" autoStart={false} />
      <HelpMenu userId="seller-123" variant="fixed" />
      
      <div data-tour="my-section">
        {/* Your content */}
      </div>
    </>
  );
}
```

### Create New Tutorial Sequence

1. Add to `src/lib/config/tutorial-steps.ts`:

```typescript
export const MY_TUTORIAL: TutorialSequence = {
  id: 'my-tutorial',
  name: 'My Feature Guide',
  description: 'Learn how to use this feature',
  category: TutorialCategory.PRODUCTS,
  isRequired: false,
  estimatedDuration: 90,
  steps: [
    {
      id: 'step-1',
      target: '[data-tour="element-1"]',
      content: '<h3>Step Title</h3><p>Step description</p>',
      placement: 'bottom',
      category: TutorialCategory.PRODUCTS,
    },
  ],
};
```

2. Add to `ALL_TUTORIAL_SEQUENCES` array

### Add Tooltip

1. Add to `src/lib/config/help-tooltips.ts`:

```typescript
{
  id: 'my-tooltip',
  target: '[data-tooltip="my-element"]',
  title: 'Help Title',
  content: 'Help description',
  category: TutorialCategory.PRODUCTS,
  placement: 'top',
  isDismissible: true,
  priority: 3,
}
```

2. Use in component:

```tsx
import { HelpTooltip } from '@/components/seller/HelpTooltip';

<div data-tooltip="my-element">
  <HelpTooltip tooltip={myTooltip} userId={userId} asButton />
</div>
```

## API Reference

### OnboardingService

```typescript
// Progress
OnboardingService.getProgress(userId)
OnboardingService.saveProgress(progress)
OnboardingService.completeStep(userId, stepId)
OnboardingService.completeSequence(userId, sequenceId)
OnboardingService.skipSequence(userId, sequenceId)

// Preferences
OnboardingService.getPreferences(userId)
OnboardingService.updatePreference(userId, key, value)
OnboardingService.dismissTooltip(userId, tooltipId)
OnboardingService.completeOnboarding(userId)

// Utilities
OnboardingService.shouldShowOnboarding(userId)
OnboardingService.canResumeOnboarding(userId)
OnboardingService.trackEvent(event)
```

### Components

```tsx
// OnboardingTour
<OnboardingTour
  userId="seller-123"
  sequence={GETTING_STARTED_TUTORIAL}
  onComplete={() => {}}
  onSkip={() => {}}
  autoStart={true}
/>

// TutorialManager
<TutorialManager
  userId="seller-123"
  autoStart={true}
/>

// HelpMenu
<HelpMenu
  userId="seller-123"
  variant="fixed" // or "inline"
/>

// HelpTooltip
<HelpTooltip
  tooltip={tooltipConfig}
  userId="seller-123"
  asButton={true}
/>
```

## Data Attributes

```html
<!-- Tour targets -->
<div data-tour="element-id">...</div>

<!-- Tooltip targets -->
<div data-tooltip="tooltip-id">...</div>

<!-- Manual triggers -->
<button data-tour-trigger="getting-started">Start Tour</button>
```

## Storage Keys

- `mash_tutorial_progress` - Progress data
- `mash_onboarding_preferences` - User preferences
- `onboarding_events` - Analytics (sessionStorage)

## Styling

```tsx
// Joyride styles configured in OnboardingTour.tsx
styles={{
  options: {
    primaryColor: '#2563eb',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
  }
}}
```

## Troubleshooting

### Tutorial not starting
- Check `data-tour` attribute exists on target element
- Verify element is visible on page load
- Check localStorage for existing progress

### Progress not saving
- Check browser localStorage enabled
- Verify userId is consistent
- Check console for errors

### Confetti not showing
- Check canvas-confetti installed
- Verify browser supports canvas
- Check browser console for errors

## Best Practices

1. **Keep steps concise** - Max 50-60 words per step
2. **Use HTML formatting** - Lists, bold, icons for clarity
3. **Test all tour paths** - Forward, backward, skip
4. **Make tooltips dismissible** - Don't force users
5. **Track analytics** - Monitor completion rates
6. **Progressive disclosure** - Required first, optional later
7. **Mobile responsive** - Test on small screens
8. **Accessibility** - Keyboard nav, ARIA labels
