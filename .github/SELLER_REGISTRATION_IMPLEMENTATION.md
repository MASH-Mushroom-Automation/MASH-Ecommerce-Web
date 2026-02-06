# Seller Registration Flow - Issue #88

## Overview
Complete seller registration form with multi-step wizard interface, input validation, and business information collection.

## Components Created

### 1. **SellerRegistrationForm** (`src/components/seller/SellerRegistrationForm.tsx`)
Main form component that orchestrates the multi-step registration process.

**Features:**
- Multi-step wizard with 4 steps
- Progress indicator
- Form state persistence using localStorage
- Zod validation with React Hook Form
- Mobile-responsive design
- Loading states and error handling

### 2. **Validation Schemas** (`src/lib/validations/seller-registration.ts`)
Zod validation schemas for type-safe form validation.

**Schemas:**
- `businessInfoSchema` - Business name, description, category, type
- `contactInfoSchema` - Contact person, email, phone, address
- `taxLegalInfoSchema` - TIN, DTI/SEC registration, bank details
- `termsConditionsSchema` - Terms, policies, data accuracy
- `sellerRegistrationSchema` - Combined schema for full form

**Constants:**
- `BUSINESS_CATEGORIES` - Predefined business categories
- `PHILIPPINE_REGIONS` - Philippine regions for address

### 3. **Form Storage Utility** (`src/lib/utils/form-storage.ts`)
localStorage helper for persisting form state across sessions.

**Functions:**
- `saveFormData()` - Save form data to localStorage
- `getFormData()` - Retrieve saved form data
- `clearFormData()` - Clear saved data
- `hasSavedFormData()` - Check if draft exists
- `saveCurrentStep()` / `getCurrentStep()` - Step persistence
- Auto-expiry after 7 days

### 4. **Step Components** (`src/components/seller/steps/`)
Individual step form components:

#### `BusinessInfoStep.tsx`
- Business name (required)
- Business description (20-500 chars, required)
- Business category (dropdown, required)
- Business type (individual/sole proprietor/partnership/corporation, required)
- Established year (optional)

#### `ContactInfoStep.tsx`
- Contact person name (required)
- Email address (required, validated)
- Mobile number (required, Philippine format)
- Alternative phone (optional)
- Business address:
  - Street, Barangay, City, Province (all required)
  - Region dropdown (required)
  - Postal code (optional, 4 digits)

#### `TaxLegalInfoStep.tsx`
All fields optional but recommended:
- Tax ID Number (TIN format: XXX-XXX-XXX-XXX)
- DTI Registration Number (for sole proprietors)
- SEC Registration Number (for corporations)
- Business Permit Number
- Bank account details (name, bank, account number)

#### `TermsConditionsStep.tsx`
- Terms of Service agreement (required)
- Seller Policy agreement (required)
- Privacy Policy agreement (required)
- Data accuracy acknowledgment (required)
- Visual cards explaining each policy

### 5. **ProgressIndicator** (`src/components/seller/ProgressIndicator.tsx`)
Visual step progress component with:
- Step circles with checkmarks
- Progress bar connecting steps
- Responsive labels (full on desktop, current only on mobile)
- Step counter for mobile

## Usage Example

```tsx
import { SellerRegistrationForm } from "@/components/seller";

export default function SellerRegistrationPage() {
  const handleSuccess = () => {
    // Navigate to success page or dashboard
    router.push("/seller/registration-success");
  };

  const handleCancel = () => {
    // Handle cancellation
    router.push("/");
  };

  return (
    <SellerRegistrationForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
```

## API Integration

The form submits to `/api/seller/register` endpoint. Expected payload:

```typescript
{
  // Business Information
  businessName: string;
  businessDescription: string;
  businessCategory: string;
  businessType: "individual" | "sole_proprietor" | "partnership" | "corporation";
  establishedYear?: string;

  // Contact Information
  contactPersonName: string;
  email: string;
  phoneNumber: string;
  alternativePhone?: string;
  businessAddress: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    region: string;
    postalCode?: string;
  };

  // Tax & Legal Information (all optional)
  taxIdNumber?: string;
  dtiRegistrationNumber?: string;
  secRegistrationNumber?: string;
  businessPermitNumber?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;

  // Terms & Conditions
  agreeToTerms: boolean;
  agreeToSellerPolicy: boolean;
  agreeToPrivacyPolicy: boolean;
  acknowledgeDataAccuracy: boolean;
}
```

## Phone Number Validation

Philippine mobile numbers are validated and normalized:
- Accepts: `09123456789`, `+639123456789`, `9123456789`
- Normalizes to: `+639123456789`
- Pattern: `^(\+63|0)?9\d{9}$`

## Form State Persistence

- Automatically saves form data to localStorage on every change
- Draft expires after 7 days
- User can:
  - Continue from saved draft
  - Save draft manually
  - Discard draft and start over
- Step progress is also saved

## Validation Rules

### Required Fields:
- Business name (2-100 chars)
- Business description (20-500 chars)
- Business category
- Business type
- Contact person name
- Email
- Phone number
- Street address
- Barangay
- City
- Province
- Region
- All 4 terms checkboxes

### Optional Fields:
- Established year
- Alternative phone
- Postal code
- All tax & legal information

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Error messages clearly associated with fields
- Focus management between steps
- Screen reader friendly

## Mobile Responsiveness

- Single column layout on mobile
- Two-column grid on desktop for some fields
- Simplified progress indicator on mobile
- Touch-friendly button sizes
- Responsive spacing and typography

## Next Steps

1. **API Endpoint**: Create `src/app/api/seller/register/route.ts`
2. **Success Page**: Create seller registration success page
3. **Testing**: Write unit and integration tests
4. **Backend Integration**: Connect to actual backend API
5. **Document Upload**: Add optional document upload feature (DTI, SEC, permits)
6. **Email Verification**: Add email verification step if needed

## Testing Checklist

- [ ] Form validation works for all fields
- [ ] Step navigation (Next/Back buttons)
- [ ] Form state persistence
- [ ] Draft save and restore
- [ ] Mobile responsive design
- [ ] All terms must be checked to submit
- [ ] Error handling and display
- [ ] Loading states
- [ ] API integration
- [ ] Success/error flows

## Files Changed/Created

### Created:
- `src/lib/validations/seller-registration.ts`
- `src/lib/utils/form-storage.ts`
- `src/components/seller/SellerRegistrationForm.tsx` (updated with Zod)
- `src/components/seller/ProgressIndicator.tsx`
- `src/components/seller/steps/BusinessInfoStep.tsx`
- `src/components/seller/steps/ContactInfoStep.tsx`
- `src/components/seller/steps/TaxLegalInfoStep.tsx`
- `src/components/seller/steps/TermsConditionsStep.tsx`
- `src/components/seller/index.ts`

## Dependencies Required

All dependencies should already be installed:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`
- `sonner` (toast notifications)
- `lucide-react` (icons)

---

**Status**: ✅ Complete - Ready for API integration and testing
**Related Issue**: #88
**Developer**: GitHub Copilot
**Date**: December 15, 2025
