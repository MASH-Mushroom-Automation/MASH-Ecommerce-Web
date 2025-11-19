# 🤖 AI Prompts for MASH Custom CMS Migration

This file contains ready-to-use AI prompts for setting up MASH's custom JSON-based CMS in your project. Copy the relevant prompt and paste it into your AI assistant (GitHub Copilot, ChatGPT, Claude, etc.).

**Important:** These prompts are for MASH's custom CMS (JSON-based), NOT Sanity CMS.

---

## 📋 Table of Contents

1. [PROMPT 1: Complete CMS Setup](#prompt-1-complete-cms-setup)
2. [PROMPT 2: Add Custom Content Type](#prompt-2-add-custom-content-type)
3. [PROMPT 3: Upgrade to Database](#prompt-3-upgrade-to-database)
4. [PROMPT 4: Create Admin Dashboard](#prompt-4-create-admin-dashboard)
5. [PROMPT 5: Add Image Upload UI](#prompt-5-add-image-upload-ui)
6. [PROMPT 6: Implement Content Versioning](#prompt-6-implement-content-versioning)
7. [PROMPT 7: Add Search Functionality](#prompt-7-add-search-functionality)
8. [PROMPT 8: Create Content Preview](#prompt-8-create-content-preview)
9. [PROMPT 9: Add Rate Limiting](#prompt-9-add-rate-limiting)
10. [PROMPT 10: Migrate Existing Data](#prompt-10-migrate-existing-data)

---

## PROMPT 1: Complete CMS Setup

**Use when:** Starting from scratch, need full CMS implementation

**Copy this prompt:**

```
I need to set up a custom JSON-based CMS in my Next.js 15 (App Router) project with TypeScript.

REQUIREMENTS:
- JSON file storage (no external CMS service)
- Next.js API routes for CRUD operations
- TypeScript interfaces for type safety
- React hooks for easy data fetching in components
- File upload system for images
- Support for these content types:
  • Hero sections (homepage banners with title, subtitle, images, CTA buttons)
  • Features sections (USP cards with icons, headlines, descriptions)
  • FAQ system (categories and questions/answers)
  • About page content (hero, challenges, solutions, vision, mentors)
  • Team members (name, role, bio, avatar, social links)
  • Contact information (phone, email, address, hours)
  • Site settings (title, description, logo, social links)

PROJECT STRUCTURE:
My Next.js app uses:
- Path alias: @/ (maps to src/ folder)
- App Router (not Pages Router)
- TypeScript strict mode
- Tailwind CSS
- lucide-react for icons

CREATE THESE FILES:

1. **src/lib/cms/config.ts**
   - CMS configuration constants
   - Upload path, max file size, allowed file types
   - Helper function to generate unique IDs
   - Validation utilities

2. **src/lib/cms/database.ts**
   - JSON file read/write operations
   - CRUD functions for each content type
   - Data stored in data/cms/ directory
   - Export named objects like HeroAPI, FeaturesAPI, FAQAPI, etc.

3. **src/types/cms.ts**
   - TypeScript interfaces for all content types
   - Base interface: CMSBaseModel (id, isActive, displayOrder, createdAt, updatedAt)
   - Extend for each content type

4. **src/app/api/cms/hero/route.ts**
   - GET: Return all hero sections
   - POST: Create new hero section
   - Filter by activeOnly query param
   - Return format: { data: T[], success: boolean }

5. **src/app/api/cms/hero/[id]/route.ts**
   - GET: Return single hero by ID
   - PUT: Update hero by ID
   - DELETE: Delete hero by ID

6. **Repeat API routes pattern for:**
   - features/
   - faq/ (+ faq/categories/)
   - about/
   - team/
   - contact/
   - site/

7. **src/app/api/cms/upload/route.ts**
   - POST endpoint for file uploads
   - Accept FormData with 'file' field
   - Save to public/uploads/ directory
   - Return file URL
   - Validate file type and size

8. **src/hooks/useCMS.ts**
   - React hooks for each content type:
     • useHeroes()
     • useFeatures()
     • useFAQ()
     • useAboutContent()
     • useTeamMembers()
     • useContactInfo()
     • useSiteSettings()
   - Each returns: { data, loading, error, refetch }
   - Handle loading states and errors

9. **setup-cms.js** (project root)
   - Node.js script to initialize sample data
   - Creates data/cms/ directory
   - Populates with sample content for all types
   - Run with: node setup-cms.js

RESPONSE FORMAT:
For each API endpoint, use:
```typescript
// Success
return NextResponse.json({ 
  data: result, 
  success: true,
  message?: "Optional success message"
});

// Error
return NextResponse.json({ 
  success: false, 
  error: "Error message" 
}, { status: 500 });
```

IMPORTANT:
- Use fs/promises for async file operations
- Store JSON files in data/cms/ directory
- Generate IDs with: `Date.now().toString(36) + Math.random().toString(36).substr(2)`
- All timestamps in ISO 8601 format
- Support filtering by isActive=true
- Support sorting by displayOrder

Provide complete, production-ready code for all files.
```

**Expected output:** Complete CMS setup ready to use

---

## PROMPT 2: Add Custom Content Type

**Use when:** Need to add new content type (e.g., Testimonials, Blog Posts, Products)

**Copy this prompt:**

```
I have MASH custom CMS running in my Next.js 15 project. I need to add a new content type: [CONTENT_TYPE_NAME].

EXISTING SETUP:
- src/lib/cms/config.ts (configuration)
- src/lib/cms/database.ts (CRUD operations)
- src/types/cms.ts (TypeScript interfaces)
- src/app/api/cms/* (API routes)
- src/hooks/useCMS.ts (React hooks)

NEW CONTENT TYPE: [CONTENT_TYPE_NAME]

FIELDS NEEDED:
[List your fields here, for example:]
- title: string (required)
- description: string (required)
- author: string
- publishedAt: string (ISO 8601)
- featured: boolean
- tags: string[]
- image: string (URL)

TASKS:
1. Add TypeScript interface to src/types/cms.ts
   - Extend CMSBaseModel interface
   - Include all fields above

2. Add CRUD operations to src/lib/cms/database.ts
   - Export [ContentType]API object
   - Methods: getAll(), getById(id), create(data), update(id, data), delete(id)
   - Store in data/cms/[contentType].json

3. Create API routes:
   - src/app/api/cms/[contentType]/route.ts (GET, POST)
   - src/app/api/cms/[contentType]/[id]/route.ts (GET, PUT, DELETE)

4. Add React hook to src/hooks/useCMS.ts
   - Function: use[ContentType]()
   - Return: { [contentType], loading, error, refetch }

5. Add sample data to setup-cms.js
   - Create 3-5 example entries

FOLLOW EXISTING PATTERNS:
- Use same response format as other endpoints
- Match coding style in existing files
- Include proper TypeScript types
- Add error handling

Provide complete code for all changes.
```

**Example usage:**
```
NEW CONTENT TYPE: Testimonials

FIELDS NEEDED:
- author: string (required)
- role: string (required)
- content: string (required, max 500 chars)
- rating: number (1-5)
- avatar: string (URL, optional)
- company: string (optional)
- featured: boolean (default false)
```

---

## PROMPT 3: Upgrade to Database

**Use when:** Ready to replace JSON storage with PostgreSQL/MongoDB

**Copy this prompt:**

```
I have MASH custom CMS using JSON file storage. I need to upgrade to [PostgreSQL/MongoDB] for production.

CURRENT SETUP:
- JSON files in data/cms/ directory
- CRUD operations in src/lib/cms/database.ts
- Content types: Hero, Features, FAQ, About, Team, Contact, Site

TARGET DATABASE: [PostgreSQL with Prisma / MongoDB with Mongoose]

MIGRATION TASKS:

1. **Install dependencies:**
   [For PostgreSQL]: prisma, @prisma/client
   [For MongoDB]: mongoose

2. **Create database schema:**
   [For Prisma]: prisma/schema.prisma with all content types
   [For Mongoose]: src/models/*.ts with schemas

3. **Update src/lib/cms/database.ts:**
   - Replace fs operations with database queries
   - Keep same API (getAll, getById, create, update, delete)
   - Maintain response format
   - Add connection pooling

4. **Create migration script:**
   - Read existing JSON files
   - Insert into database
   - Verify data integrity
   - Script: migrate-cms-to-db.js

5. **Update environment variables:**
   - DATABASE_URL or MONGODB_URI
   - Connection settings

6. **Add database utilities:**
   - Connection handler
   - Error handling
   - Query optimization

REQUIREMENTS:
- Zero downtime migration (read from JSON as fallback)
- Maintain API compatibility (no frontend changes needed)
- Add indexes for frequently queried fields
- Include transaction support for multi-step operations
- Add connection retry logic

SCHEMA REQUIREMENTS:
- All existing fields from TypeScript interfaces
- Add createdAt, updatedAt timestamps (auto-managed)
- Add indexes on: id, isActive, displayOrder
- Add full-text search indexes on text fields

Provide:
1. Complete database schema
2. Updated database.ts with DB queries
3. Migration script
4. Environment variable setup
5. Database connection utilities
```

---

## PROMPT 4: Create Admin Dashboard

**Use when:** Need UI to manage CMS content

**Copy this prompt:**

```
I have MASH custom CMS with API routes. I need to create an admin dashboard to manage content through a web interface.

EXISTING SETUP:
- API routes at /api/cms/*
- Content types: Hero, Features, FAQ, About, Team, Contact, Site
- TypeScript interfaces in src/types/cms.ts

ADMIN DASHBOARD REQUIREMENTS:

1. **Layout Structure:**
   - Admin route: /admin/cms
   - Sidebar navigation for each content type
   - Protected routes (require authentication)
   - Responsive design (mobile-friendly)

2. **Hero Management Page** (/admin/cms/heroes)
   - Table view with columns: Title, Status (Active/Inactive), Order, Actions
   - Actions: Edit, Delete, Toggle Active
   - "Create New Hero" button
   - Sort by displayOrder
   - Search/filter functionality

3. **Hero Form** (Create/Edit)
   - Fields: Title, Subtitle, Background Images (upload), Primary Button, Secondary Button
   - Image upload with preview
   - Button fields: Text, URL, Variant (dropdown)
   - Display Order (number input)
   - Active toggle switch
   - Save and Cancel buttons
   - Form validation with error messages

4. **Repeat for other content types:**
   - Features
   - FAQ (with category management)
   - About
   - Team
   - Contact
   - Site Settings

TECHNICAL REQUIREMENTS:
- Use React Hook Form + Zod for validation
- Use shadcn/ui components (Table, Form, Button, Input, Dialog)
- Loading states during API calls
- Toast notifications for success/error
- Confirmation dialogs for delete actions
- Optimistic UI updates
- Image upload with drag-and-drop
- Rich text editor for long content (e.g., About page)

AUTHENTICATION:
- Protect all /admin routes with [Clerk/NextAuth]
- Check user role (only admins can access)
- Redirect to login if not authenticated

UI COMPONENTS NEEDED:
1. AdminLayout.tsx (sidebar + content area)
2. DataTable.tsx (reusable table component)
3. ContentForm.tsx (generic form for any content type)
4. ImageUpload.tsx (drag-and-drop upload)
5. ConfirmDialog.tsx (delete confirmation)

Provide complete code for:
1. Admin layout structure
2. One complete content management page (Heroes)
3. Reusable components (DataTable, ContentForm)
4. Route protection middleware
```

---

## PROMPT 5: Add Image Upload UI

**Use when:** Need better image upload experience

**Copy this prompt:**

```
I need to create a user-friendly image upload component for my MASH CMS admin dashboard.

REQUIREMENTS:

**Component: ImageUpload.tsx**

FEATURES:
- Drag-and-drop area (visual feedback on hover)
- Click to browse files
- Image preview before upload
- Progress bar during upload
- Multiple file upload support (optional)
- File validation:
  • Max size: 5MB
  • Allowed types: PNG, JPG, WebP
  • Show error toast for invalid files
- Delete uploaded image
- Replace existing image
- Copy image URL button

UPLOAD FLOW:
1. User drags image or clicks browse
2. Show image preview immediately
3. Upload to /api/cms/upload endpoint
4. Show progress bar (0-100%)
5. On success: Display uploaded image with URL
6. On error: Show error message, allow retry

API INTEGRATION:
- POST /api/cms/upload
- Send FormData with 'file' field
- Receive: { success: true, url: "/uploads/filename.jpg" }

UI DESIGN:
- Dashed border when empty
- Solid border when file hovered
- Green border on successful upload
- Red border on error
- Image preview fills container (object-cover)
- Overlay with actions: View, Replace, Delete
- Responsive (mobile-friendly)

USAGE EXAMPLE:
```tsx
<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  onError={(error) => toast.error(error)}
  maxSize={5 * 1024 * 1024} // 5MB
  accept="image/png,image/jpeg,image/webp"
/>
```

TECH STACK:
- React with TypeScript
- Tailwind CSS for styling
- lucide-react for icons
- shadcn/ui Button component
- File API for reading files

Provide complete component code with all features.
```

---

## PROMPT 6: Implement Content Versioning

**Use when:** Need to track changes and rollback capability

**Copy this prompt:**

```
I need to add content versioning to my MASH custom CMS so I can track changes and rollback if needed.

CURRENT SETUP:
- JSON-based storage in data/cms/
- Update operations replace existing data
- No history tracking

VERSIONING REQUIREMENTS:

1. **Version Storage:**
   - Store all versions in data/cms/versions/[contentType]/[id]/
   - Each version as separate JSON file: [timestamp].json
   - Keep last 10 versions per content item
   - Metadata: version number, timestamp, userId, changeDescription

2. **Update src/lib/cms/database.ts:**
   - Before update: Save current version
   - Add getVersionHistory(contentType, id)
   - Add restoreVersion(contentType, id, versionId)
   - Add compareVersions(contentType, id, v1, v2)

3. **API Endpoints:**
   - GET /api/cms/[contentType]/[id]/versions
     • Returns: Array of version metadata
   - GET /api/cms/[contentType]/[id]/versions/[versionId]
     • Returns: Full content of specific version
   - POST /api/cms/[contentType]/[id]/restore
     • Body: { versionId: string }
     • Restores content to specific version
   - GET /api/cms/[contentType]/[id]/compare
     • Query: ?v1=timestamp1&v2=timestamp2
     • Returns: Diff between two versions

4. **Admin UI Components:**
   - Version History modal
     • Show version list with timestamps and user
     • Preview version content
     • Compare with current version (side-by-side diff)
     • Restore button with confirmation
   - Visual diff display (highlight changes)
   - Breadcrumb: Current → [Version X] → Restore

5. **Version Metadata:**
   ```typescript
   interface ContentVersion {
     versionId: string;
     timestamp: string;
     userId: string;
     userEmail: string;
     changeDescription?: string;
     contentSnapshot: any; // Full content
   }
   ```

CLEANUP STRATEGY:
- Auto-delete versions older than 30 days
- Keep maximum 10 versions per item
- Option to mark versions as "important" (never delete)

Provide:
1. Updated database.ts with version functions
2. API routes for version management
3. React component for version history UI
4. Diff visualization component
```

---

## PROMPT 7: Add Search Functionality

**Use when:** Need to search across all CMS content

**Copy this prompt:**

```
I need to add full-text search functionality to my MASH custom CMS.

REQUIREMENTS:

1. **Search API Endpoint:**
   - GET /api/cms/search
   - Query params:
     • q: search query (required)
     • types: comma-separated content types to search (optional, default: all)
     • limit: max results (default: 20)
   - Response format:
     ```json
     {
       "success": true,
       "data": {
         "results": [
           {
             "id": "hero-1",
             "type": "hero",
             "title": "Welcome to MASH",
             "snippet": "...matching text...",
             "url": "/admin/cms/heroes/hero-1",
             "score": 0.95
           }
         ],
         "total": 42,
         "query": "mushroom",
         "took": 23 // milliseconds
       }
     }
     ```

2. **Search Implementation:**
   - Search across these fields:
     • Heroes: title, subtitle
     • Features: title, subtitle, feature headlines
     • FAQ: question, answer
     • About: all text content
     • Team: name, role, bio
   - Case-insensitive search
   - Partial word matching
   - Relevance scoring (title matches score higher)
   - Support for multi-word queries
   - Exclude inactive content

3. **Advanced Search Options:**
   - Exact phrase search: "fresh mushrooms"
   - Exclude terms: mushroom -dried
   - Type filtering: type:hero OR type:features
   - Date range: created:2024-01-01..2024-12-31

4. **Search Indexing:**
   - Create search index in memory on server start
   - Update index when content changes
   - Store in data/cms/search-index.json (optional cache)
   - Rebuild index endpoint: POST /api/cms/search/rebuild

5. **Admin UI Search Component:**
   - Global search bar in admin header
   - Search input with debounce (300ms)
   - Dropdown results with:
     • Content type badge
     • Title
     • Snippet with highlighted query terms
     • Click to navigate to edit page
   - "See all results" link
   - Keyboard navigation (up/down arrows, enter to select)
   - Empty state: "No results found"

6. **Search Results Page:**
   - /admin/cms/search?q=query
   - Grouped by content type
   - Pagination
   - Filters: Content type, date range
   - Sort: Relevance, Date (newest/oldest)

PERFORMANCE:
- Cache search results for 5 minutes
- Limit query length to 100 characters
- Return max 100 results

TECH STACK:
- Node.js built-in string methods (or use fuse.js for fuzzy search)
- React for UI
- Debounce with lodash or custom hook

Provide:
1. Search API implementation
2. Search indexing logic
3. Global search component (SearchBar.tsx)
4. Search results page
```

---

## PROMPT 8: Create Content Preview

**Use when:** Need to preview content before publishing

**Copy this prompt:**

```
I need to add a content preview feature to my MASH CMS admin dashboard so editors can see how content will look on the website before publishing.

REQUIREMENTS:

1. **Preview Mode:**
   - Route: /preview/[contentType]/[id]
   - Query param: ?draft=true (loads unsaved changes)
   - Displays content using actual website components
   - Show preview banner: "Preview Mode - This is how content will appear"
   - Exit preview button → Returns to admin

2. **Admin Integration:**
   - Add "Preview" button in edit forms
   - Opens preview in new tab/window
   - Pass draft content via URL params or session storage
   - Split-screen mode option (edit form + preview side-by-side)

3. **Preview API Endpoints:**
   - POST /api/cms/preview/[contentType]
     • Body: Draft content (not yet saved)
     • Returns: Preview token (expires in 10 minutes)
   - GET /api/cms/preview/[contentType]/[id]?token=xyz
     • Returns: Draft content for preview
     • Validates token
     • No authentication required (token is secret)

4. **Preview Components:**
   - PreviewBanner.tsx
     • Shows at top of preview page
     • "Preview Mode" badge
     • Content type and title
     • Exit preview button
     • Edit button (returns to form)
   - PreviewFrame.tsx
     • Renders actual website components
     • Applies same styles as production
     • Responsive preview (desktop/tablet/mobile toggle)

5. **Device Preview:**
   - Desktop view (default)
   - Tablet view (768px width)
   - Mobile view (375px width)
   - Toggle buttons in preview banner

6. **Real-time Preview:**
   - As user types in form, preview updates
   - Use WebSocket or polling for updates
   - Debounce updates (500ms)

SECURITY:
- Preview tokens expire after 10 minutes
- Store tokens in Redis/memory (not database)
- Validate token on every preview request
- No personal/sensitive data in preview URLs

USAGE FLOW:
1. Editor clicks "Preview" in admin form
2. System generates preview token with draft content
3. Opens /preview/hero/[id]?token=xyz in new tab
4. Preview page loads draft content
5. Shows preview banner with exit/edit buttons
6. Token expires after 10 minutes

Provide:
1. Preview API endpoints
2. Preview page component
3. Preview banner component
4. Token generation and validation logic
5. Integration with admin forms
```

---

## PROMPT 9: Add Rate Limiting

**Use when:** Need to protect API endpoints from abuse

**Copy this prompt:**

```
I need to add rate limiting to my MASH CMS API endpoints to prevent abuse and ensure fair usage.

REQUIREMENTS:

1. **Rate Limiting Strategy:**
   - Public endpoints (GET): 100 requests per 15 minutes per IP
   - Admin endpoints (POST/PUT/DELETE): 30 requests per 15 minutes per IP
   - Upload endpoint: 10 requests per 15 minutes per IP
   - Search endpoint: 60 requests per 15 minutes per IP

2. **Implementation:**
   - Use middleware for all /api/cms/* routes
   - Store rate limit data in memory (or Redis for production)
   - Track by IP address (or user ID if authenticated)
   - Return 429 Too Many Requests when limit exceeded

3. **Response Headers:**
   - X-RateLimit-Limit: Maximum requests allowed
   - X-RateLimit-Remaining: Requests remaining
   - X-RateLimit-Reset: Unix timestamp when limit resets
   - Retry-After: Seconds until limit resets (on 429 response)

4. **Rate Limit Middleware:**
   ```typescript
   // src/lib/cms/rateLimiter.ts
   export function rateLimit(options: {
     windowMs: number;  // Time window in milliseconds
     max: number;       // Max requests per window
   }) {
     // Return middleware function
   }
   ```

5. **Usage in API Routes:**
   ```typescript
   // src/app/api/cms/hero/route.ts
   import { rateLimit } from '@/lib/cms/rateLimiter';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // 100 requests per 15 minutes
   });

   export async function GET(request: NextRequest) {
     const rateLimitResult = await limiter(request);
     if (!rateLimitResult.success) {
       return NextResponse.json({
         success: false,
         error: 'Too many requests'
       }, { 
         status: 429,
         headers: rateLimitResult.headers 
       });
     }

     // Continue with normal logic
   }
   ```

6. **Admin UI Feedback:**
   - Show rate limit info in admin dashboard
   - Display remaining requests in header
   - Warning when approaching limit
   - Error toast when limit exceeded with retry time

7. **Whitelist:**
   - Allow bypassing rate limits for specific IPs
   - Environment variable: RATE_LIMIT_WHITELIST=127.0.0.1,10.0.0.1

8. **Logging:**
   - Log rate limit violations
   - Alert if IP exceeds limit multiple times
   - Dashboard to view rate limit statistics

STORAGE OPTIONS:
- Development: In-memory Map
- Production: Redis with TTL

ERROR RESPONSE:
```json
{
  "success": false,
  "error": "Too many requests. Please try again in 10 minutes.",
  "retryAfter": 600
}
```

Provide:
1. Rate limiter middleware implementation
2. Usage examples for different endpoints
3. Admin UI component to display rate limit status
4. Environment configuration
```

---

## PROMPT 10: Migrate Existing Data

**Use when:** Have content in another CMS/format, need to import into MASH

**Copy this prompt:**

```
I have existing content in [WordPress/Contentful/Strapi/Custom Format] and need to migrate it to MASH custom CMS.

CURRENT DATA SOURCE:
- Platform: [Platform Name]
- Export format: [JSON/CSV/XML/Database]
- Content types to migrate:
  • [List your content types]
  • [e.g., Pages, Posts, Media, etc.]

MASH CMS TARGET:
- Content types: Hero, Features, FAQ, About, Team, Contact, Site
- Storage: JSON files in data/cms/

MIGRATION REQUIREMENTS:

1. **Data Mapping:**
   Map source fields to MASH CMS fields:
   ```
   [Source Content Type] → [MASH Content Type]
   - source_field_1 → mash_field_1
   - source_field_2 → mash_field_2
   - ...
   ```

   Example:
   ```
   WordPress Pages → MASH Hero Sections
   - post_title → title
   - post_excerpt → subtitle
   - featured_image → backgroundImages[0]
   - custom_field_cta → primaryButton.text
   ```

2. **Migration Script:**
   - File: migrate-to-mash-cms.js
   - Read data from source
   - Transform to MASH format
   - Validate against TypeScript interfaces
   - Write to data/cms/ directory
   - Generate unique IDs
   - Set timestamps

3. **Image Migration:**
   - Download images from source
   - Save to public/uploads/
   - Update image URLs in content
   - Preserve image metadata (alt text, captions)

4. **Data Validation:**
   - Check required fields
   - Validate field types
   - Verify relationships (e.g., FAQ categories)
   - Report errors and warnings
   - Dry-run mode (preview without writing)

5. **Conflict Resolution:**
   - Handle duplicate content
   - Merge or skip strategy
   - Preserve existing MASH content
   - Option to backup before migration

6. **Progress Reporting:**
   ```
   Migrating content...
   ✓ [10/50] Pages migrated
   ✓ [25/25] Media files downloaded
   ✗ [2/50] Pages failed (see errors.log)
   
   Summary:
   - Total items: 75
   - Successful: 73
   - Failed: 2
   - Duration: 45 seconds
   ```

7. **Post-Migration Tasks:**
   - Generate migration report
   - List failed items with reasons
   - Verify data in MASH CMS
   - Test API endpoints
   - Check admin dashboard

MIGRATION SCRIPT USAGE:
```bash
node migrate-to-mash-cms.js --source=export.json --dry-run
node migrate-to-mash-cms.js --source=export.json --backup
node migrate-to-mash-cms.js --source=export.json --type=pages
```

SOURCE DATA FORMAT:
[Paste sample of your source data here]

Provide:
1. Complete migration script
2. Data transformation logic
3. Error handling and reporting
4. Validation functions
5. Usage instructions
```

---

## 🎯 Quick Selection Guide

**Choose your prompt based on your goal:**

| Goal | Prompt | Time |
|------|--------|------|
| Set up CMS from scratch | PROMPT 1 | 30-60 min |
| Add new content type | PROMPT 2 | 15-30 min |
| Upgrade to database | PROMPT 3 | 1-2 hours |
| Build admin dashboard | PROMPT 4 | 2-4 hours |
| Better image uploads | PROMPT 5 | 30-60 min |
| Track content changes | PROMPT 6 | 1-2 hours |
| Search all content | PROMPT 7 | 1-2 hours |
| Preview before publish | PROMPT 8 | 1-2 hours |
| Protect from abuse | PROMPT 9 | 30-60 min |
| Import existing data | PROMPT 10 | 1-3 hours |

---

## 💡 Tips for Using AI Prompts

1. **Be specific:** Customize the prompts with your exact requirements
2. **Provide context:** Mention your framework, dependencies, file structure
3. **Show examples:** Include sample data or existing code patterns
4. **Review output:** AI-generated code needs review and testing
5. **Iterate:** Ask follow-up questions if output isn't quite right
6. **Test thoroughly:** Verify AI code works in your environment

---

## 🔧 Customization Template

When using any prompt, replace these placeholders:

- `[CONTENT_TYPE_NAME]` → Your content type (e.g., "Testimonials", "Blog Posts")
- `[Platform Name]` → Source CMS (e.g., "WordPress", "Contentful")
- `[PostgreSQL/MongoDB]` → Your database choice
- `[Clerk/NextAuth]` → Your auth provider
- `[List your fields]` → Actual field names and types

---

## 🆘 If AI Output Isn't Working

1. **Check versions:** Ensure AI used correct Next.js version (15+ with App Router)
2. **Verify imports:** Check all import paths match your project structure
3. **Fix types:** Add missing TypeScript type definitions
4. **Test incrementally:** Test each part before moving to next
5. **Ask for fixes:** Paste error messages back to AI with context
6. **Consult docs:** Check MASH CMS docs in `docs/CMS/` folder

---

## 📚 Related Documentation

- Complete setup guide: `docs/CMS/CMS-INTEGRATION-README.md`
- API examples: `docs/CMS/CMS-API-IMPLEMENTATION.md`
- Admin dashboard: `docs/CMS/CMS-ADMIN-DASHBOARD-INTERFACE.md`
- Quick start: `.github/QUICKSTART.md`

---

**Last Updated:** November 19, 2025  
**For:** MASH E-Commerce Web Custom CMS  
**Version:** 1.0.0
