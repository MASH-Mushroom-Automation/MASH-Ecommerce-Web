# Profile Picture Upload - Pull Request

## Summary

Adds profile picture upload functionality to the `/profile/my-information` page using Firebase Storage. Users can upload, preview, and remove their profile photo through a dialog-based interface with drag-and-drop support.

## Branch

`profile-picture-upload` -> `develop`

## Changes

### New Files (4)

| File | Purpose |
|------|---------|
| `src/lib/firebase/storage.ts` | Firebase Storage service: upload, delete, validate profile images |
| `src/components/profile/ProfilePictureUpload.tsx` | Upload component with dialog UI, drag-and-drop, preview, progress |
| `src/lib/firebase/__tests__/storage.test.ts` | 21 unit tests for storage service |
| `src/components/profile/__tests__/ProfilePictureUpload.test.tsx` | 20 unit tests for upload component |
| `e2e/tests/profile-picture-upload.spec.ts` | 5 Playwright e2e tests |

### Modified Files (3)

| File | Change |
|------|--------|
| `src/app/(user)/profile/my-information/page.tsx` | Replaced static avatar with `ProfilePictureUpload` component |
| `src/lib/firebase/index.ts` | Added barrel exports for storage service |
| `next.config.js` | Added `firebasestorage.googleapis.com` to image domains and CSP |

## Feature Details

### Upload Flow

1. User clicks camera icon overlay on their avatar
2. Dialog opens with drag-and-drop zone
3. User selects or drops an image file (JPEG, PNG, or WebP, max 5 MB)
4. Circular preview shown with upload button
5. Upload progress bar displays real-time progress
6. On completion, profile photo updates across the app via AuthContext
7. Old profile picture is automatically deleted from Storage

### Storage Architecture

- **Path pattern**: `profile-pictures/{userId}/avatar_{timestamp}`
- **Supported formats**: JPEG, PNG, WebP
- **Max file size**: 5 MB
- **Old photo cleanup**: Previous photo is deleted before uploading new one
- **Firestore sync**: `photoURL` and `avatar` fields updated via `AuthContext.updateUserProfile`

### Component API

```tsx
<ProfilePictureUpload
  user={user}
  onUploadComplete={async (photoURL: string) => {
    await updateUserProfile({ photoURL, avatar: photoURL });
  }}
/>
```

**Props:**
- `user`: Object with optional `photoURL`, `imageUrl`, `avatar`, `displayName`, `email`
- `onUploadComplete`: Async callback receiving the new download URL

### Key Functions

```typescript
// Upload a profile picture to Firebase Storage
uploadProfilePicture(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult>

// Delete a profile picture from Firebase Storage
deleteProfilePicture(storagePath: string): Promise<void>

// Validate file type and size before upload
validateProfileImage(file: File): { valid: boolean; error?: string }
```

## Accessibility

- Keyboard navigable: Tab to camera button, Enter/Space to open dialog
- ARIA labels on all interactive elements
- Screen reader announcements for upload state changes
- Focus management within dialog
- Descriptive alt text on avatar image

## Test Coverage

### Unit Tests: 41 total

**Storage Service (21 tests):**
- File validation (type, size, edge cases)
- Upload flow (progress callbacks, success, error handling)
- Delete operations (success, missing file handling)
- Constants verification (MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES)

**Upload Component (20 tests):**
- Rendering (avatar display, camera button, fallback initials)
- Dialog behavior (open, close, state reset)
- File selection (valid files, invalid type rejection, size rejection)
- Drag-and-drop (dragOver styling, file drop handling)
- Upload flow (progress display, success toast, error toast, profile update)
- Accessibility (ARIA labels, keyboard interaction, screen reader text)

### E2E Tests: 5 total

- Camera button visibility on profile page
- Dialog open/close behavior
- Upload button disabled state without file
- File selection with preview display
- Dialog accessibility structure

## Quality Gates

| Check | Status |
|-------|--------|
| Build (`npm run build`) | PASS - all routes compiled |
| Lint (`npm run lint`) | PASS - zero errors/warnings |
| TypeScript | PASS - no type errors |
| Unit Tests | PASS - 2834/2834 (0 skipped) |
| New Tests | PASS - 41/41 |
| No Regressions | PASS - all 2793 existing tests still passing |

## Configuration Changes

### next.config.js

**Image domains** - Added `firebasestorage.googleapis.com` to `remotePatterns` for Next.js Image optimization of uploaded profile photos.

**CSP headers** - Added `https://firebasestorage.googleapis.com` to `connect-src` directive to allow Storage API calls from the browser.

## Security Considerations

- File type validated both client-side (accept attribute + validation function) and before upload
- File size enforced at 5 MB limit before upload attempt
- Storage path scoped to user ID prevents cross-user access
- Firebase Security Rules should restrict `/profile-pictures/{userId}/` writes to authenticated user matching `{userId}`

## Recommended Firebase Storage Rules

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/(jpeg|png|webp)');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Screenshots

> Manual verification needed:
> - Camera button overlay on avatar at `/profile/my-information`
> - Upload dialog with drag-and-drop zone
> - File preview (circular crop) before upload
> - Progress bar during upload
> - Updated avatar after successful upload

## Dependencies

No new dependencies added. Uses `firebase/storage` which is already bundled in the existing `firebase@12.6.0` package (`@firebase/storage@0.14.0`).

## How to Test Manually

1. Navigate to `/profile/my-information` (must be logged in)
2. Click the camera icon on the avatar
3. Select or drag a JPEG/PNG/WebP image (under 5 MB)
4. Verify circular preview appears
5. Click "Upload Photo"
6. Verify progress bar and success toast
7. Verify avatar updates across the page
8. Try removing the photo with "Remove Photo" link
9. Test with invalid file types (should show error)
10. Test with files over 5 MB (should show error)
