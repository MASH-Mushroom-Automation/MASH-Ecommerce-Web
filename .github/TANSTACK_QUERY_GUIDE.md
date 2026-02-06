# TanStack Query (React Query) Guide - Complete Flow

> **Understanding the Flow**: How we implemented TanStack Query for data fetching

## 📚 Table of Contents

1. [Concept Comparison: Zustand vs TanStack Query](#concept-comparison)
2. [Setup Flow](#setup-flow)
3. [Creating Queries](#creating-queries)
4. [Using in Components](#using-in-components)
5. [Advanced Features](#advanced-features)

---

## Concept Comparison: Zustand vs TanStack Query

### Zustand Pattern (State Management)

```
1. Create Store → 2. Define Actions → 3. Import & Use in Components
```

```typescript
// 1. Create Store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 2. Use in Component
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

### TanStack Query Pattern (Server State Management)

```
1. Setup Provider → 2. Create Query Hook → 3. Import & Use in Components
```

```typescript
// 1. Setup Provider (already done globally)
<QueryProvider>
  <App />
</QueryProvider>

// 2. Create Query Hook
export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });
}

// 3. Use in Component
const { data, isLoading, error, refetch } = useData();
```

**Key Difference:**

- **Zustand** = Client-side state (user inputs, UI state)
- **TanStack Query** = Server state (API data, caching, auto-refetch)

---

## Setup Flow

### Step 1: Install TanStack Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Create QueryClient Provider

**File:** `src/components/providers/query-provider.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (once per app)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // Data fresh for 1 minute
            refetchOnWindowFocus: false, // Don't refetch on window focus
            retry: 1,                    // Retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools for debugging (only in dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Why?** Think of QueryClient as the "store manager" - it handles all caching, refetching, and state.

### Step 3: Add Provider to App Layout

**File:** `src/app/client-layout.tsx`

```typescript
import { QueryProvider } from "@/components/providers/query-provider";

export function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <QueryProvider>  {/* ← Wraps entire app */}
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
```

**Provider Hierarchy:**

```
ThemeProvider
  └── QueryProvider  ← TanStack Query (manages server state)
      └── AuthProvider
          └── CartProvider (Zustand for client state)
              └── App Components
```

---

## Creating Queries

### The Pattern

**Structure:**

```
1. Define fetch function → 2. Create custom hook with useQuery → 3. Export hook
```

### Example: Admin Dashboard Query

**File:** `src/hooks/useAdminDashboard.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { AdminDashboardData, AdminDashboardResponse } from "@/types/admin";

// ============================================
// STEP 1: Define the Fetch Function
// ============================================
async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  // Call your API (with auth token handling)
  const response = await apiRequest<AdminDashboardResponse>(
    "/admin/dashboard",
    { method: "GET" }
  );

  // Validate response
  if (!response.success) {
    throw new Error("Failed to fetch admin dashboard data");
  }

  // Return only the data we need
  return response.data;
}

// ============================================
// STEP 2: Create Custom Hook with useQuery
// ============================================
export function useAdminDashboard() {
  return useQuery({
    // Unique key - used for caching
    queryKey: ["admin", "dashboard"],

    // The function to fetch data
    queryFn: fetchAdminDashboard,

    // Optional: Configuration
    staleTime: 1 * 60 * 1000, // Data fresh for 1 min
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 min
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window focused
    retry: 2, // Retry 2 times on failure
  });
}
```

### Breaking Down useQuery

```typescript
const result = useQuery({
  queryKey: ["admin", "dashboard"], // ← Cache identifier
  queryFn: fetchAdminDashboard, // ← Your fetch function
});
```

**Query Key Explained:**

```typescript
// Simple key
queryKey: ["todos"]; // All todos

// Key with parameters
queryKey: ["todos", userId]; // User's todos
queryKey: ["todos", { status: "active" }]; // Filtered todos

// Hierarchical keys
queryKey: ["admin", "dashboard"]; // Admin dashboard data
queryKey: ["seller", sellerId, "orders"]; // Seller's orders
```

**Why?** Keys are used for:

- Caching (same key = cached data)
- Invalidation (refetch specific data)
- Sharing data across components

---

## Using in Components

### Basic Usage

**File:** `src/app/(seller)/seller/dashboard/page.tsx`

```typescript
"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Dashboard() {
  // ============================================
  // STEP 3: Use the Hook in Component
  // ============================================
  const {
    data,        // ← The fetched data
    isLoading,   // ← Initial loading state
    isError,     // ← Error state
    error,       // ← Error object
    refetch,     // ← Function to manually refetch
    isFetching   // ← Background refetch state
  } = useAdminDashboard();

  // ============================================
  // Handle Loading State
  // ============================================
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ============================================
  // Handle Error State
  // ============================================
  if (isError) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  // ============================================
  // Render Data
  // ============================================
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Use the data */}
      <p>Pending Orders: {data?.alert.pendingOrders}</p>
      <p>Total Sales: {data?.metrics.totalSales.value}</p>

      {/* Manual refresh */}
      <button onClick={() => refetch()}>
        Refresh Data
      </button>

      {/* Show background loading */}
      {isFetching && <span>Updating...</span>}
    </div>
  );
}
```

### Return Values Explained

```typescript
const {
  // Data & States
  data, // Fetched data (undefined initially)
  error, // Error object if request failed

  // Boolean States
  isLoading, // true during INITIAL fetch
  isError, // true if query failed
  isSuccess, // true if query succeeded
  isFetching, // true during ANY fetch (initial or background)

  // Status
  status, // 'pending' | 'error' | 'success'
  fetchStatus, // 'fetching' | 'paused' | 'idle'

  // Functions
  refetch, // Manually trigger refetch

  // Timestamps
  dataUpdatedAt, // When data was last updated
  errorUpdatedAt, // When error occurred
} = useAdminDashboard();
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APP INITIALIZATION                                       │
├─────────────────────────────────────────────────────────────┤
│ App starts → QueryProvider wraps app → QueryClient created │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COMPONENT MOUNTS                                         │
├─────────────────────────────────────────────────────────────┤
│ Dashboard component mounts → Calls useAdminDashboard()     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. QUERY EXECUTED                                           │
├─────────────────────────────────────────────────────────────┤
│ QueryClient checks cache for ["admin", "dashboard"]        │
│                                                              │
│ If CACHED & FRESH → Return cached data immediately          │
│ If STALE         → Return cached, fetch in background       │
│ If NO CACHE      → Fetch data, show loading                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FETCH DATA                                               │
├─────────────────────────────────────────────────────────────┤
│ fetchAdminDashboard() called                                 │
│  → apiRequest("/admin/dashboard")                            │
│  → Backend returns data                                      │
│  → Data validated & transformed                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. UPDATE CACHE & COMPONENT                                 │
├─────────────────────────────────────────────────────────────┤
│ QueryClient stores data in cache                            │
│ Component re-renders with data                              │
│ isLoading: false, data: {...}                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. AUTO-REFETCH (Background)                                │
├─────────────────────────────────────────────────────────────┤
│ After 5 minutes → Refetch automatically                     │
│ Window focus    → Refetch if data is stale                  │
│ Network reconnect → Refetch if was offline                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Advanced Features

### 1. Multiple Components Sharing Data

```typescript
// Component A
function Dashboard() {
  const { data } = useAdminDashboard();
  return <div>Sales: {data?.metrics.totalSales.value}</div>;
}

// Component B (different file)
function Header() {
  const { data } = useAdminDashboard();  // ← Same query key!
  return <div>Orders: {data?.alert.pendingOrders}</div>;
}
```

**What happens?**

- Both use the same query key `["admin", "dashboard"]`
- TanStack Query makes **ONE** API call
- Both components share the cached data
- When data updates, both components re-render

### 2. Dependent Queries

```typescript
// First query
const { data: user } = useUser();

// Second query depends on first
const { data: orders } = useQuery({
  queryKey: ["orders", user?.id],
  queryFn: () => fetchOrders(user.id),
  enabled: !!user?.id, // ← Only run if user.id exists
});
```

### 3. Mutations (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    // The mutation function
    mutationFn: (product) => apiRequest("/products", {
      method: "PUT",
      body: JSON.stringify(product)
    }),

    // On success, invalidate and refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}

// Usage in component
const updateProduct = useUpdateProduct();

<button onClick={() => updateProduct.mutate(productData)}>
  Save
</button>
```

### 4. Optimistic Updates

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["products"] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["products"]);

    // Optimistically update UI
    queryClient.setQueryData(["products"], (old) => [...old, newProduct]);

    // Return context for rollback
    return { previous };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(["products"], context.previous);
  },
});
```

---

## Real-World Example: Our Admin Dashboard

### Flow Breakdown

```
User visits /seller/dashboard
         ↓
Dashboard component renders
         ↓
useAdminDashboard() called
         ↓
TanStack Query checks cache for ["admin", "dashboard"]
         ↓
No cache found (first visit)
         ↓
isLoading = true → Show <LoadingSpinner />
         ↓
fetchAdminDashboard() executes
         ↓
apiRequest("/admin/dashboard") called
  - Adds Authorization header with JWT token
  - Makes GET request to backend
         ↓
Backend responds with:
{
  success: true,
  data: {
    alert: { pendingOrders: 0 },
    metrics: { totalSales: {...}, orders: {...} },
    charts: { weeklySales: [...], revenueTrend: [...] }
  }
}
         ↓
TanStack Query:
  - Stores data in cache
  - Sets isLoading = false
  - Sets data = response.data
         ↓
Component re-renders with data
         ↓
UI displays:
  - Stats cards with metrics
  - Charts with weeklySales & revenueTrend
  - Alert message
         ↓
5 minutes pass → Auto-refetch triggered
         ↓
isFetching = true (but UI still shows old data)
         ↓
New data fetched → Cache updated → UI updates smoothly
```

### Code Implementation

**1. Hook Definition** (`src/hooks/useAdminDashboard.ts`)

```typescript
async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiRequest<AdminDashboardResponse>(
    "/admin/dashboard",
    { method: "GET" }
  );
  return response.data;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
```

**2. Component Usage** (`src/app/(seller)/seller/dashboard/page.tsx`)

```typescript
export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return (
    <>
      {/* Stats Cards */}
      <StatsCard
        title="Total Sales"
        value={`${data.metrics.totalSales.currency} ${data.metrics.totalSales.value}`}
        change={`+${data.metrics.totalSales.change}%`}
      />

      {/* Charts */}
      <BarChart data={data.charts.weeklySales} />
      <LineChart data={data.charts.revenueTrend} />

      {/* Manual Refresh */}
      <button onClick={() => refetch()}>Refresh</button>
    </>
  );
}
```

---

## Comparison Summary

| Feature                | Zustand      | TanStack Query |
| ---------------------- | ------------ | -------------- |
| **Purpose**            | Client state | Server state   |
| **Data Source**        | In-memory    | API calls      |
| **Caching**            | Manual       | Automatic      |
| **Auto-refetch**       | No           | Yes            |
| **Loading states**     | Manual       | Built-in       |
| **Error handling**     | Manual       | Built-in       |
| **Sharing data**       | Via store    | Via query key  |
| **Optimistic updates** | Manual       | Built-in       |
| **DevTools**           | Limited      | Powerful       |

### When to Use Each?

**Use Zustand for:**

- User inputs (form data)
- UI state (modals, sidebars)
- Theme preferences
- Shopping cart (local)
- Navigation state

**Use TanStack Query for:**

- API data (products, orders, users)
- Dashboard metrics
- Search results
- User profiles (from server)
- Any data from backend

### Can They Work Together?

**Yes!** Common pattern:

```typescript
// Zustand - UI state
const useStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen }))
}));

// TanStack Query - Server data
const { data: products } = useProducts();

// Component
function Dashboard() {
  const isSidebarOpen = useStore(s => s.isSidebarOpen);
  const { data } = useProducts();

  return (
    <>
      <Sidebar open={isSidebarOpen} />
      <ProductList products={data} />
    </>
  );
}
```

---

## Debugging with DevTools

TanStack Query includes powerful DevTools:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />  {/* ← Add this */}
</QueryClientProvider>
```

**What you can see:**

- All active queries
- Cached data
- Query status (fresh, stale, fetching)
- Refetch history
- Manually trigger refetches
- Inspect query timings

**How to use:**

1. Open your app in browser
2. Look for floating icon in bottom corner
3. Click to open DevTools panel
4. Explore your queries!

---

## Common Patterns

### Pattern 1: Loading & Error States

```typescript
const { data, isLoading, isError, error } = useData();

if (isLoading) return <Skeleton />;
if (isError) return <Error message={error.message} />;
return <DataDisplay data={data} />;
```

### Pattern 2: Background Refetch Indicator

```typescript
const { data, isFetching, refetch } = useData();

return (
  <div>
    <button onClick={() => refetch()} disabled={isFetching}>
      <RefreshIcon className={isFetching ? "animate-spin" : ""} />
      Refresh
    </button>
    {data && <DataDisplay data={data} />}
  </div>
);
```

### Pattern 3: Conditional Queries

```typescript
const [enabled, setEnabled] = useState(false);

const { data } = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  enabled: enabled,  // ← Only fetch when true
});

<button onClick={() => setEnabled(true)}>Load Data</button>
```

---

## Summary

**The TanStack Query Flow:**

1. **Setup** → Create QueryProvider → Wrap app
2. **Create** → Define fetch function → Create useQuery hook
3. **Use** → Import hook → Use in component → Handle states
4. **Enjoy** → Auto-caching, refetching, error handling, devtools

**Key Concepts:**

- **Query Keys** = Cache identifiers
- **Query Functions** = Fetch logic
- **Query Hooks** = useQuery wrapper
- **QueryClient** = Cache manager
- **Auto-refetch** = Keep data fresh
- **Shared cache** = One fetch, many components

**Remember:**

- TanStack Query for **server state** (API data)
- Zustand for **client state** (UI state)
- They complement each other!

---

## Next Steps

1. ✅ Basic queries (you know this now!)
2. 📚 Learn mutations (create/update/delete)
3. 🎯 Pagination & infinite queries
4. ⚡ Optimistic updates
5. 🔄 Query invalidation strategies
6. 📊 Performance optimization

**Official Docs:** https://tanstack.com/query/latest

Happy querying! 🚀
