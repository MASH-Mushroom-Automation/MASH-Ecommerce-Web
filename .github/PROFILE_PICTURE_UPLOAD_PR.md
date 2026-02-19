# Profile Picture Upload - Pull Request

## Summary

Resolves the Firebase Storage 404 error that prevented profile picture uploads. The root cause was that the Firebase Storage bucket (`mash-ddf8d.appspot.com` / `mash-ddf8d.firebasestorage.app`) was never provisioned in the Firebase Console. Instead of requiring manual infrastructure setup, this PR replaces Firebase Storage with a **client-side Canvas API approach** that generates optimized data URLs stored directly in Firestore.

## Branch

`Profile-Picture-Upload` -> `main`

## Root Cause Analysis

**Symptom:** POST and OPTIONS requests to `firebasestorage.googleapis.com/v0/b/mash-ddf8d.appspot.com/o` returned **404 Not Found**. CORS preflight failed as a secondary symptom.

**Root Cause:** Firebase Storage was **never enabled** for project `mash-ddf8d`. Neither the legacy bucket format (`mash-ddf8d.appspot.com`) nor the new format (`mash-ddf8d.firebasestorage.app`) exists in Google Cloud Storage. The Firebase Console Storage tab was never activated with "Get Started".

**Resolution:** Replaced Firebase Storage SDK with client-side Canvas API. Images are resized to 256x256, compressed as JPEG at 80% quality, and returned as data URLs stored in Firestore via the existing `updateUserProfile` callback. This eliminates all external storage dependencies and CORS issues.

## Solution Architecture

### Upload Flow

1. User selects an image file (JPEG, PNG, or WebP, max 5 MB)
2. File is validated (type + size checks)
3. `FileReader` loads the file as a data URL
4. `Image` element renders the data URL
5. `Canvas` resizes to fit within 256x256 pixels (maintaining aspect ratio)
6. Canvas exports compressed JPEG data URL (80% quality, typically 15-40 KB)
7. Data URL is returned and stored in Firestore via `updateUserProfile({ photoURL, avatar: photoURL })`

### Why Canvas + Firestore

| Factor | Firebase Storage | Canvas + Firestore |
|--------|-----------------|-------------------|
| Infrastructure needed | Bucket provisioning + CORS config | None (Firestore already active) |
| CORS issues | Requires `gsutil cors set` | None (no cross-origin requests) |
| External dependencies | `firebase/storage` SDK | Browser Canvas API (built-in) |
| Latency | Upload to GCS + download URL fetch | Instant (local processing) |
| Cost | Storage + bandwidth charges | Included in Firestore reads |
| Image size | Original file size | 15-40 KB after resize |

## Changes

### Modified Files

| File | Change |
|------|--------|
| `src/lib/firebase/storage.ts` | Complete rewrite: removed all Firebase Storage SDK imports, added Canvas-based `resizeImage()`, `uploadProfilePicture()` returns data URLs, `deleteProfilePicture()` is a no-op |
| `src/lib/avatar.ts` | `isValidAvatarUrl()` accepts `data:` URLs; `isDiceBearAvatar()` returns true for `data:` URLs (enables `unoptimized` prop on Next.js Image) |
| `src/lib/firebase/__tests__/storage.test.ts` | Complete rewrite: replaced Firebase Storage SDK mocks with Canvas/FileReader/Image mocks, 42 tests |
| `firebase.json` | Removed storage rules reference and storage emulator config |

### Deleted Files

| File | Reason |
|------|--------|
| `storage.rules` | Firebase Storage security rules no longer needed |

### Unchanged Files (API Compatibility)

| File | Reason |
|------|--------|
| `src/components/profile/ProfilePictureUpload.tsx` | Same `uploadProfilePicture` interface maintained |
| `src/app/(user)/profile/my-information/page.tsx` | `onUploadComplete` callback unchanged |
| `src/lib/firebase/index.ts` | Barrel exports unchanged (same function signatures) |

## Function Signatures (Unchanged Interface)

```typescript
// Upload: validates, resizes via Canvas, returns data URL
uploadProfilePicture(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  previousStoragePath?: string  // Kept for API compatibility (unused)
): Promise<UploadResult>

// Delete: no-op (data URLs managed in Firestore)
deleteProfilePicture(storagePath: string): Promise<void>

// Validate: unchanged
validateProfileImage(file: File): string | null

// Internal: Canvas-based resize (not exported)
resizeImage(file: File, maxDimension?: number): Promise<string>
```

## Test Coverage

### Storage Service - 42 unit tests

- **validateProfileImage (16 tests):** JPEG/PNG/WebP valid; GIF/SVG/BMP/TIFF/PDF/text/video/empty MIME rejected; size boundary at 5 MB; error message content
- **Constants (6 tests):** MAX_FILE_SIZE = 5242880; ACCEPTED_IMAGE_TYPES has exactly 3 entries
- **uploadProfilePicture (16 tests):** data URL generation, storage path with userId, progress callbacks (0% -> 50% -> 100%), progress states (running -> success), validation rejection, FileReader mock verification, Canvas mock verification, JPEG output verification, different user paths, previousStoragePath ignored
- **deleteProfilePicture (4 tests):** no-op for any path, empty path, void return, no storage interaction

### Component Tests - 30 tests (unchanged, all passing)

### Full Test Suite - 2865 tests across 129 suites

## Quality Gates

| Check | Status | Details |
|-------|--------|---------|
| Unit Tests | PASS | 2865/2865 passing (129 suites) |
| Build | PASS | All routes compiled, zero errors |
| Lint | PASS | Zero warnings, zero errors |
| TypeScript | PASS | No type errors |

## Technical Decisions

### Data URL size in Firestore
- Resized images (256x256 JPEG at 80% quality): 15-40 KB raw, 20-55 KB as base64
- Firestore document max: 1 MiB - well within limits
- Profile documents are read infrequently - extra bytes are negligible

### Future migration path to Firebase Storage
If Firebase Storage is eventually enabled in the Firebase Console:
1. Update `storage.ts` to use Firebase Storage SDK again
2. Restore `storage.rules` with security rules
3. Configure CORS: `gsutil cors set cors.json gs://BUCKET_NAME`
4. The component layer requires **zero changes** (same interface maintained)

## How to Test

1. Log in with any account
2. Navigate to Profile > My Information
3. Click the camera icon on the avatar
4. Select a JPEG, PNG, or WebP image (under 5 MB)
5. Verify the preview appears in the dialog
6. Click "Upload" and verify:
   - Progress bar shows 0% -> 50% -> 100%
   - Toast notification "Profile picture updated!" appears
   - Avatar updates immediately
7. Refresh the page - avatar should persist (stored in Firestore)
8. Test with invalid files (GIF, PDF) - should show error
9. Test with files over 5 MB - should show size error

## Deployment Notes

No environment variable changes needed. No infrastructure setup required. The solution works immediately on any deployment target since it only uses the browser Canvas API and existing Firestore connection.

## Dependencies

No new dependencies. Removed runtime dependency on `firebase/storage` SDK (still bundled but no longer imported by `storage.ts`).
