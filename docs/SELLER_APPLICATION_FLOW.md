# Seller Application Flow Documentation

**Last Updated:** November 6, 2025  
**Version:** 2.0  
**Status:** ✅ Implemented

---

## 📋 Overview

The MASH e-commerce platform implements a **three-state seller application flow** where users progress from non-seller → pending approval → approved seller. This ensures admin oversight and quality control before granting seller access.

---

## 🔄 Three-State Flow

### State 1: **Not Applied** (`sellerStatus: 'none'`)
**User Status:** Regular buyer, has not applied to become a seller

**UI Display:**
```
Top Bar: "Start Selling" (clickable link)
```

**Actions Available:**
- ✅ Click "Start Selling" → redirects to `/start-selling`
- ✅ Fill out seller application form
- ✅ Submit application for admin review

**Behavior:**
- User sees "Start Selling" in all headers
- Cannot access seller dashboard (`/seller/*` routes)
- Form submission changes status to `pending`

---

### State 2: **Pending Approval** (`sellerStatus: 'pending'`)
**User Status:** Application submitted, awaiting admin approval

**UI Display:**
```
Top Bar: "Application Pending ⏳" (yellow text, non-clickable)
```

**Actions Available:**
- ❌ Cannot access seller dashboard
- ✅ Can still shop as a buyer
- ⏳ Wait for admin approval notification

**Behavior:**
- User sees "Application Pending ⏳" with tooltip: "Your seller application is awaiting admin approval"
- Seller dashboard routes return 403 or redirect
- Admin receives notification of new application
- Admin reviews application details

**Backend Requirements:**
- `POST /api/seller/application` → Sets `sellerStatus: 'pending'`
- Admin dashboard shows pending applications
- `PUT /api/admin/seller-applications/:id/approve` → Changes to `approved`
- `PUT /api/admin/seller-applications/:id/reject` → Changes back to `none`

---

### State 3: **Approved Seller** (`sellerStatus: 'approved'`)
**User Status:** Admin has approved the seller application

**UI Display:**
```
Top Bar: "Seller Center" (clickable link to dashboard)
```

**Actions Available:**
- ✅ Full access to seller dashboard (`/seller/dashboard`)
- ✅ Create/edit products
- ✅ Manage orders
- ✅ View analytics
- ✅ Manage settings

**Behavior:**
- User sees "Seller Center" link in all headers
- Can switch between buyer and seller modes
- Receives seller-specific notifications

**Backend Requirements:**
- All `/api/seller/*` endpoints accessible
- User has `sellerStatus: 'approved'`
- Seller profile data created
- Seller ID linked to products/orders

---

## 🗂️ Type Definition

```typescript
// src/types/api.ts

export type SellerStatus = 'none' | 'pending' | 'approved';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  sellerStatus: SellerStatus; // Three-state seller status
  isSeller?: boolean; // @deprecated - Use sellerStatus === 'approved' instead
  preferences: {
    interests: string[];
    cookingLevel: string;
    notifications: boolean;
  };
}
```

---

## 🎨 Implementation in Headers

### Main Header (`header.tsx`)
```tsx
// Three-state seller status logic
const sellerStatus = isMounted ? (profile?.sellerStatus || 'none') : 'none';

{sellerStatus === 'approved' ? (
  <Link href="/seller/dashboard" className="hover:underline">
    Seller Center
  </Link>
) : sellerStatus === 'pending' ? (
  <span className="text-yellow-300 cursor-not-allowed" 
        title="Your seller application is awaiting admin approval">
    Application Pending ⏳
  </span>
) : (
  <Link href="/start-selling" className="hover:underline">
    Start Selling
  </Link>
)}
```

### Seller Header (`seller-header.tsx`)
- Same logic as main header
- Used only when user is in seller section

### Simple Header (`simple-header.tsx`)
- Same logic as main header
- Used for auth pages (login, signup, etc.)

---

## 🔐 Route Protection

### Seller Dashboard Protection
```tsx
// src/app/(seller)/seller/layout.tsx or middleware

export default function SellerLayout({ children }) {
  const { profile } = useUserProfile();
  const router = useRouter();
  
  useEffect(() => {
    if (profile && profile.sellerStatus !== 'approved') {
      toast.error('Seller access not approved');
      router.push('/start-selling');
    }
  }, [profile, router]);
  
  if (!profile || profile.sellerStatus !== 'approved') {
    return <LoadingSpinner />;
  }
  
  return <>{children}</>;
}
```

---

## 📡 API Endpoints Required

### Frontend → Backend Integration

#### 1. Submit Seller Application
```
POST /api/seller/application
Body: {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessRegistration?: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  products: string; // Brief description
  termsAccepted: boolean;
}
Response: {
  success: true;
  message: "Application submitted successfully";
  data: {
    applicationId: string;
    status: 'pending';
  }
}
```

#### 2. Get Application Status
```
GET /api/seller/application/status
Response: {
  success: true;
  data: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
    reviewNote?: string;
  }
}
```

#### 3. Admin: List Pending Applications
```
GET /api/admin/seller-applications?status=pending
Response: {
  success: true;
  data: [
    {
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      businessName: string;
      submittedAt: string;
      status: 'pending';
    }
  ];
  pagination: {...}
}
```

#### 4. Admin: Review Application
```
PUT /api/admin/seller-applications/:id/approve
Body: {
  reviewNote?: string;
}
Response: {
  success: true;
  message: "Seller approved successfully";
}

PUT /api/admin/seller-applications/:id/reject
Body: {
  reviewNote: string; // Required for rejection
}
Response: {
  success: true;
  message: "Application rejected";
}
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **State 1: Not Applied**
  - [ ] See "Start Selling" in header
  - [ ] Click "Start Selling" → navigate to form
  - [ ] Fill and submit form
  - [ ] Status changes to `pending`

- [ ] **State 2: Pending**
  - [ ] See "Application Pending ⏳" in header
  - [ ] Hover shows tooltip
  - [ ] Cannot click (cursor: not-allowed)
  - [ ] Cannot access `/seller/dashboard`
  - [ ] Can still shop as buyer

- [ ] **State 3: Approved**
  - [ ] Admin approves application
  - [ ] User receives notification
  - [ ] Header changes to "Seller Center"
  - [ ] Can access seller dashboard
  - [ ] All seller features work

### Edge Cases

- [ ] User logs out during `pending` → still shows pending on next login
- [ ] User tries to access seller routes with `pending` → redirected
- [ ] Application rejected → status back to `none`, can reapply
- [ ] User switches between buyer/seller modes seamlessly

---

## 🚨 Migration Guide

### For Existing Codebases

If your codebase currently uses `isSeller: boolean`, migrate to `sellerStatus`:

**Before:**
```tsx
if (profile?.isSeller) {
  // Show seller dashboard
}
```

**After:**
```tsx
if (profile?.sellerStatus === 'approved') {
  // Show seller dashboard
}
```

**Database Migration:**
```sql
-- Add new column
ALTER TABLE users ADD COLUMN seller_status VARCHAR(10) DEFAULT 'none';

-- Migrate existing data
UPDATE users 
SET seller_status = 'approved' 
WHERE is_seller = true;

-- Keep is_seller for backward compatibility (optional)
```

---

## 📊 Status Diagram

```
┌─────────────┐
│   none      │ ← User has not applied
│ (Not Applied)│
└──────┬──────┘
       │
       │ Submit Application
       │
       ▼
┌─────────────┐
│  pending    │ ← Admin review required
│ (Pending)   │
└──────┬──────┘
       │
       ├───────────────┐
       │               │
       │ Approve       │ Reject
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│  approved   │  │   none      │
│ (Active)    │  │ (Can Reapply)│
└─────────────┘  └─────────────┘
```

---

## 🎯 Benefits

1. **Quality Control**: Admin approval prevents spam sellers
2. **Better UX**: Clear status communication to users
3. **Security**: Unauthorized users cannot access seller features
4. **Transparency**: Users know exactly where they are in the process
5. **Scalability**: Easy to add more states (e.g., 'suspended', 'verified')

---

## 🔜 Future Enhancements

- [ ] Email notifications for status changes
- [ ] In-app notification badge for pending applications
- [ ] Seller verification levels (Bronze/Silver/Gold)
- [ ] Auto-approval for verified email domains
- [ ] Rejection reason categories
- [ ] Application resubmission tracking
- [ ] Seller performance metrics affecting status

---

## 📞 Support

For implementation questions or issues:
- Frontend: Check `src/components/layout/header.tsx`
- Types: Check `src/types/api.ts`
- Mock Data: Check `src/lib/api/user.ts`
- Backend API: Reference `docs/MISSING-API-ENDPOINTS.md`

---

*End of Documentation*
