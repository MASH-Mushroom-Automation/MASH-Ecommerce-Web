# MASH Quick Start Guide

Get up and running with the MASH marketplace in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A code editor (VS Code recommended)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/MASH-Ecommerce-Web.git
cd MASH-Ecommerce-Web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
MASH-Ecommerce-Web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Auth pages (login, signup, etc.)
│   │   ├── (shop)/            # Shop pages (catalog, product details)
│   │   ├── (seller)/          # Seller dashboard
│   │   └── grower/            # Grower profiles
│   ├── components/            # React components
│   │   ├── common/           # Shared components (errors, loading)
│   │   └── layout/           # Layout components (header, footer, nav)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and services
│   │   └── websocket/        # WebSocket client
│   └── types/                # TypeScript types
├── public/                   # Static assets
└── documents/               # Documentation
```

## Key Features

### 1. API Routes (Mock Data Ready)

All API routes work with mock data by default:

```typescript
// Get products
fetch('/api/products?page=1&limit=12')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Create order
fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [...],
    shippingAddress: {...}
  })
});
```

### 2. Real-Time Features

```typescript
import { useWebSocket, useDeviceSensorData } from '@/hooks/useWebSocket';

function DeviceMonitor({ deviceId }) {
  const { sensorData } = useDeviceSensorData(deviceId);
  
  return (
    <div>
      <p>Temperature: {sensorData?.temperature}°C</p>
      <p>Humidity: {sensorData?.humidity}%</p>
    </div>
  );
}
```

### 3. Mobile Navigation

Mobile bottom navigation is automatically enabled on mobile devices:

```typescript
// Customize in: src/components/layout/mobile-bottom-nav.tsx
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/catalog", label: "Shop", icon: ShoppingBag },
  // ...
];
```

### 4. Error Handling

Wrap your app with error boundaries:

```typescript
import { ErrorBoundary } from '@/components/common/error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 5. Loading States

Use pre-built loading components:

```typescript
import { 
  PageLoader, 
  ProductSkeleton, 
  OrderSkeleton 
} from '@/components/common/loading-states';

function ProductList() {
  if (loading) return <ProductSkeleton />;
  if (error) return <ErrorFallback error={error} />;
  
  return <div>{/* products */}</div>;
}
```

## Common Tasks

### Adding a New API Route

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: { code: "UNAUTHORIZED", message: "Auth required" }
        },
        { status: 401 }
      );
    }

    // Your logic here
    return NextResponse.json({
      success: true,
      data: { ... },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: { code: "ERROR", message: error.message }
      },
      { status: 500 }
    );
  }
}
```

### Adding a New Page

```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
      <h1 className="text-3xl font-bold mb-6">My Page</h1>
      {/* Content */}
    </div>
  );
}
```

### Creating a Mobile-Optimized Component

```typescript
// Use mobile-first Tailwind classes
export function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 
                    hover:shadow-md transition-shadow
                    active:bg-gray-50">
      {/* Mobile: stack vertically, Desktop: side by side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <img 
          src={product.image} 
          className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-bold text-[#6A994E]">
              ₱{product.price}
            </span>
            <button className="bg-[#6A994E] text-white px-4 py-2 rounded-lg
                             active:bg-[#6A994E]/90">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Using WebSocket

```typescript
import { useWebSocket, useWebSocketEvent } from '@/hooks/useWebSocket';

function NotificationBell() {
  const [count, setCount] = useState(0);
  
  useWebSocketEvent('notification:new', (notification) => {
    setCount(prev => prev + 1);
    toast.success(notification.title);
  });

  return (
    <button className="relative">
      <Bell className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                       text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
```

## Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend.com

# Optional
NEXT_PUBLIC_GCASH_CLIENT_ID=your_gcash_client_id
NEXT_PUBLIC_MAYA_PUBLIC_KEY=your_maya_public_key
```

## Testing

```bash
# Run tests (when configured)
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## Mobile Testing

### On Real Devices

1. Find your local IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. Start dev server:
```bash
npm run dev
```

3. Access from mobile:
```
http://YOUR_IP:3000
```

### Using Chrome DevTools

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device
4. Test touch interactions

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

```bash
# Build
npm run build

# Start production server
npm start
```

## Common Issues

### Port 3000 already in use
```bash
# Kill the process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### WebSocket connection fails
```bash
# Make sure WebSocket server is running
# Or disable WebSocket in development:
# Comment out ws.connect() in useWebSocket hook
```

## Resources

- **API Documentation**: `/documents/API_IMPLEMENTATION_GUIDE.md`
- **Implementation Summary**: `/documents/IMPLEMENTATION_SUMMARY.md`
- **Technical Specs**: `/documents/Technical_Specifications.md`

## Getting Help

1. Check the documentation in `/documents`
2. Review example components in `/src/components`
3. Look at existing API routes in `/src/app/api`
4. Search GitHub issues
5. Contact: dev@mash.market

## Next Steps

1. ✅ Explore the demo at `http://localhost:3000`
2. ✅ Check out `/catalog` for the product listing
3. ✅ Try the mobile view (responsive design)
4. ✅ Test the mock login flow
5. ✅ Review API routes in `/api/*`
6. ✅ Read the API documentation
7. ✅ Start building your features!

---

**Happy Coding!** 🍄🚀

For more details, see the full documentation in the `/documents` folder.
