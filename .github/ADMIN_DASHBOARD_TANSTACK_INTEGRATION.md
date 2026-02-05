# Admin Dashboard API Integration with TanStack Query

> **Date:** December 15, 2025  
> **Endpoint:** `api/v1/admin/dashboard`  
> **Status:** ✅ Completed

## Overview

This document outlines the integration of the Admin Dashboard API endpoint using TanStack Query (React Query) for efficient data fetching, caching, and state management on the frontend.

## What Was Implemented

### 1. TanStack Query Setup

**Files Created/Modified:**

- `src/components/providers/query-provider.tsx` - QueryClient provider wrapper
- `src/app/client-layout.tsx` - Added QueryProvider to the app layout

**Configuration:**

```typescript
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,        // Data fresh for 1 minute
    refetchOnWindowFocus: false,  // Don't refetch on focus
    retry: 1,                     // Retry failed requests once
  }
}
```

**Features:**

- React Query DevTools enabled in development
- Global query client configuration
- Integrated into existing provider hierarchy (Theme → Query → Auth → Cart → Wishlist)

### 2. TypeScript Types

**File:** `src/types/admin.ts`

Added comprehensive types for the dashboard API response:

```typescript
export interface AdminDashboardAlert {
  pendingOrders: number;
  message: string;
}

export interface AdminMetric {
  value: number;
  currency?: string;
  change: number;
  changeLabel: string;
}

export interface AdminDashboardMetrics {
  totalSales: AdminMetric;
  orders: AdminMetric;
  products: AdminMetric;
  revenue: AdminMetric;
}

export interface WeeklySalesData {
  date: string;
  day: string;
  sales: number;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
}

export interface AdminDashboardCharts {
  weeklySales: WeeklySalesData[];
  revenueTrend: RevenueTrendData[];
}

export interface AdminDashboardData {
  alert: AdminDashboardAlert;
  metrics: AdminDashboardMetrics;
  charts: AdminDashboardCharts;
}

export interface AdminDashboardResponse {
  success: boolean;
  statusCode: number;
  data: AdminDashboardData;
  timestamp: string;
  path: string;
  correlationId: string;
}
```

### 3. TanStack Query Hook

**File:** `src/hooks/useAdminDashboard.ts`

Custom hook with the following features:

```typescript
export function useAdminDashboard(): UseQueryResult<AdminDashboardData, Error>;
```

**Features:**

- Auto-refetches every 5 minutes
- Caches data for 1 minute (stale time)
- Refetches on mount and window focus
- Retries failed requests twice
- Provides loading, error, and refetch states
- Uses existing `apiRequest` client (auto JWT handling)

**Usage Example:**

```typescript
const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <DashboardContent data={data} onRefresh={refetch} />;
```

**Alternative Hook with Custom Interval:**

```typescript
export function useAdminDashboardWithInterval(
  refetchInterval: number = 5 * 60 * 1000
): UseQueryResult<AdminDashboardData, Error>;
```

### 4. Updated Dashboard Page

**File:** `src/app/(seller)/seller/dashboard/page.tsx`

**Replaced:** Old `useSellerDashboard` hook with `useAdminDashboard`

**Key Changes:**

1. Now uses TanStack Query for data fetching
2. Displays real-time data from `api/v1/admin/dashboard`
3. Enhanced loading states with spinner
4. Improved error handling with retry button
5. Visual indicators for pending orders alert
6. Dynamic metric cards with trend indicators
7. Integrated weekly sales and revenue trend charts
8. Quick action cards for navigation

**Components:**

- Alert card (conditional: pending orders vs. all up to date)
- 4 metric cards (Total Sales, Orders, Products, Revenue)
- 2 chart cards (Weekly Sales Bar Chart, Revenue Trend Line Chart)
- 3 quick action cards (Orders, Products, Settings)

### 5. Backup

**File:** `src/app/(seller)/seller/dashboard/page.tsx.backup`

Original dashboard implementation preserved for reference.

## API Endpoint Details

**URL:** `GET /api/v1/admin/dashboard`

**Authentication:** Required (JWT token from `auth-token` cookie)

**Response Structure:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "alert": {
      "pendingOrders": 0,
      "message": "All orders are up to date!"
    },
    "metrics": {
      "totalSales": {
        "value": 0,
        "currency": "PHP",
        "change": 0,
        "changeLabel": "vs. last month"
      },
      "orders": {...},
      "products": {...},
      "revenue": {...}
    },
    "charts": {
      "weeklySales": [
        {
          "date": "2025-12-09",
          "day": "Tue",
          "sales": 0
        }
      ],
      "revenueTrend": [
        {
          "month": "Jul 2025",
          "revenue": 0
        }
      ]
    }
  },
  "timestamp": "2025-12-15T10:31:14.207Z",
  "path": "/api/v1/admin/dashboard",
  "correlationId": "694da22a-2b29-4d82-96d4-146f09449a0d"
}
```

## Key Features

### 1. Automatic Refetching

- **Initial Load:** Data fetched on component mount
- **Interval:** Auto-refetch every 5 minutes
- **Window Focus:** Refetch when user returns to tab
- **Manual:** Refresh button triggers immediate refetch

### 2. Loading States

- Initial loading: Full-screen spinner with message
- Background refetch: Spinning icon on refresh button
- No layout shift during background updates

### 3. Error Handling

- User-friendly error messages
- Retry button for manual recovery
- Automatic retry (2 attempts) for network failures
- Error boundary protection

### 4. Caching

- Data cached for 1 minute (prevents unnecessary requests)
- Background updates keep data fresh
- Optimistic UI updates during refetch

### 5. Performance

- Single request for all dashboard data
- Efficient re-renders (only affected components update)
- Query deduplication (multiple components can share data)

## Benefits of TanStack Query

1. **Automatic Caching:** Reduces unnecessary API calls
2. **Background Updates:** Fresh data without user interaction
3. **Loading States:** Built-in `isLoading`, `isFetching` states
4. **Error Recovery:** Automatic retries and error boundaries
5. **DevTools:** Visual debugging of queries in development
6. **Type Safety:** Full TypeScript support
7. **Code Simplification:** Less boilerplate vs. manual `useState`/`useEffect`

## Usage in Other Components

To use the dashboard data in other components:

```typescript
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

function MyComponent() {
  const { data, isLoading } = useAdminDashboard();

  // Data is shared across components (same query key)
  // No duplicate requests made

  if (isLoading) return <Spinner />;
  return <div>Pending Orders: {data?.alert.pendingOrders}</div>;
}
```

## Testing

### Manual Testing Steps

1. **Initial Load**

   ```bash
   npm run dev
   ```

   - Navigate to `/seller/dashboard`
   - Verify loading spinner appears
   - Confirm dashboard data displays correctly

2. **Refresh Functionality**
   - Click refresh button
   - Verify spinner animation on button
   - Confirm data updates

3. **Error Handling**
   - Stop backend server
   - Reload dashboard
   - Verify error message displays
   - Click "Try Again" button
   - Restart backend and confirm recovery

4. **Auto-Refetch**
   - Wait 5 minutes
   - Observe automatic data refresh
   - Check network tab for new request

5. **Window Focus**
   - Switch to another tab
   - Wait 1+ minute
   - Return to dashboard tab
   - Verify refetch occurs

### DevTools

Open React Query DevTools (bottom-left icon in dev mode):

- View query status (fresh, stale, fetching)
- Inspect cached data
- Manually trigger refetch
- Monitor query lifecycle

## Environment Variables

No new environment variables required. Uses existing:

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- JWT token from `auth-token` cookie (automatic)

## Future Enhancements

1. **Mutations:** Add TanStack Query mutations for updating data
2. **Optimistic Updates:** Update UI before API response
3. **Infinite Queries:** For paginated lists (orders, products)
4. **Query Invalidation:** Auto-refresh related queries on actions
5. **Suspense Mode:** React Suspense integration
6. **Prefetching:** Preload data on hover/navigation

## Troubleshooting

### Issue: "Failed to fetch admin dashboard data"

**Causes:**

- Backend not running
- Invalid JWT token
- Network connectivity issues
- CORS configuration

**Solutions:**

1. Verify backend is running: `http://localhost:3000/api/v1/admin/dashboard`
2. Check browser console for detailed error
3. Inspect network tab for request/response
4. Verify JWT token in cookies (Application → Cookies → `auth-token`)

### Issue: Stale data showing

**Solution:**

- Click refresh button
- Or adjust `staleTime` in `query-provider.tsx`
- Check auto-refetch interval setting

### Issue: Too many API requests

**Solution:**

- Increase `staleTime` in QueryClient config
- Disable `refetchOnWindowFocus` if not needed
- Adjust `refetchInterval` or disable it

## Files Summary

| File                                              | Purpose              |
| ------------------------------------------------- | -------------------- |
| `src/components/providers/query-provider.tsx`     | QueryClient setup    |
| `src/types/admin.ts`                              | TypeScript types     |
| `src/hooks/useAdminDashboard.ts`                  | TanStack Query hook  |
| `src/app/(seller)/seller/dashboard/page.tsx`      | Dashboard UI         |
| `src/app/client-layout.tsx`                       | Provider integration |
| `.github/ADMIN_DASHBOARD_TANSTACK_INTEGRATION.md` | This documentation   |

## Dependencies Installed

```json
{
  "@tanstack/react-query": "^5.x.x",
  "@tanstack/react-query-devtools": "^5.x.x"
}
```

## Conclusion

The admin dashboard now uses industry-standard TanStack Query for data fetching, providing:

- Better performance through caching
- Enhanced user experience with loading states
- Automatic background updates
- Robust error handling
- Developer-friendly debugging tools

The implementation follows the project's architectural patterns and integrates seamlessly with the existing authentication and API client infrastructure.
