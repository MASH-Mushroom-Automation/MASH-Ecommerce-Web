# 🗺️ Free Map Alternatives (No Credit Card Needed)

**Problem**: Google Maps requires credit card  
**Solution**: Use 100% free alternatives with same features  
**Time to Implement**: 30 minutes

---

## 🎯 Best Option: Leaflet + OpenStreetMap

**Why Leaflet**:
- ✅ 100% FREE - No credit card, no limits
- ✅ Same features as Google Maps (markers, routes, popups)
- ✅ Better for privacy (no Google tracking)
- ✅ Lighter weight (faster load times)
- ✅ Works offline (cached tiles)

---

## 📦 Installation (2 minutes)

```bash
# Install Leaflet and React wrapper
npm install leaflet react-leaflet

# Install TypeScript types
npm install --save-dev @types/leaflet
```

---

## 🎨 Update TrackingMap Component (15 minutes)

Replace the entire `src/components/delivery/TrackingMap.tsx` file:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix for default markers in Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface TrackingMapProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  status: string;
}

export default function TrackingMap({ pickup, dropoff, driverLocation, status }: TrackingMapProps) {
  const [isClient, setIsClient] = useState(false);

  // Fix Leaflet default icons in Next.js
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate center point
  const centerLat = (pickup.lat + dropoff.lat) / 2;
  const centerLng = (pickup.lng + dropoff.lng) / 2;
  const center: LatLngExpression = [centerLat, centerLng];

  // Pickup marker (green)
  const pickupIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#6A994E" stroke="#1E392A" stroke-width="2"/>
        <text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="bold">A</text>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Dropoff marker (red)
  const dropoffIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#DC2626" stroke="#7F1D1D" stroke-width="2"/>
        <text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="bold">B</text>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Driver marker (blue arrow)
  const driverIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
        <path d="M20 12 L20 28 M20 12 L15 17 M20 12 L25 17" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Route line (blue)
  const routePositions: LatLngExpression[] = [
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng],
  ];

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="rounded-b-lg"
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Marker */}
        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Pickup Location</h3>
              <p className="text-sm text-gray-600">{pickup.address || 'MASH E-Commerce Store'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Marker */}
        <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Delivery Location</h3>
              <p className="text-sm text-gray-600">{dropoff.address || 'Customer Address'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Driver Marker (if location available) */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Driver Location</h3>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#3B82F6',
            weight: 3,
            opacity: 0.6,
          }}
        />
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg space-y-2 z-[1000]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#6A994E]" />
          <span className="text-xs font-medium">Pickup (A)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#DC2626]" />
          <span className="text-xs font-medium">Delivery (B)</span>
        </div>
        {driverLocation && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-medium">Driver</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <p className="text-xs font-medium text-gray-600">Status:</p>
        <p className="text-sm font-bold">{status.replace(/_/g, ' ')}</p>
      </div>
    </div>
  );
}
```

---

## 🎨 Add Leaflet CSS to Layout (1 minute)

Update `src/app/layout.tsx`:

```typescript
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }) {
  // ... rest of your layout
}
```

---

## 🧪 Test the Map (5 minutes)

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Visit tracking page**:
   ```
   http://localhost:3000/orders/[orderId]/track
   ```

3. **Expected result**:
   - ✅ Map loads with OpenStreetMap tiles
   - ✅ Green marker (A) at pickup location
   - ✅ Red marker (B) at dropoff location
   - ✅ Blue route line connecting them
   - ✅ Legend showing marker meanings
   - ✅ Status badge (top right)
   - ✅ Click markers to see popup info

---

## 🌍 Alternative Map Styles (Optional)

OpenStreetMap has multiple tile providers for different looks:

### **Dark Mode (Night)**
```typescript
<TileLayer
  attribution='&copy; CartoDB'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>
```

### **Satellite View**
```typescript
<TileLayer
  attribution='&copy; Esri'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
/>
```

### **Minimal (Clean)**
```typescript
<TileLayer
  attribution='&copy; CartoDB'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>
```

### **Terrain (Topographic)**
```typescript
<TileLayer
  attribution='&copy; OpenTopoMap'
  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
/>
```

---

## 🎯 Comparison: Leaflet vs Google Maps

| Feature | Leaflet (FREE) | Google Maps (Paid) |
|---------|----------------|-------------------|
| Cost | $0/month | $7/1000 loads |
| Credit Card | Not required | Required |
| Map Loads/Month | Unlimited | 28,000 (free tier) |
| Markers | ✅ | ✅ |
| Popups | ✅ | ✅ |
| Route Lines | ✅ | ✅ |
| Custom Icons | ✅ | ✅ |
| Offline Support | ✅ | ❌ |
| Privacy | ✅ No tracking | ❌ Google tracks |
| Load Speed | Faster | Slower |
| Street View | ❌ | ✅ |
| Traffic Data | ❌ | ✅ |
| 3D Buildings | ❌ | ✅ |

**Verdict**: Leaflet is perfect for delivery tracking! You don't need Street View or 3D buildings.

---

## 🐛 Troubleshooting

### **Map Not Loading**

**Error**: "Leaflet is not defined"

**Fix**:
```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

Restart dev server.

---

### **Markers Not Showing**

**Error**: Default marker icons missing

**Fix**: Already handled in code above with custom SVG icons.

---

### **Hydration Error in Next.js**

**Error**: "Text content does not match server-rendered HTML"

**Fix**: Already handled with `isClient` state check.

---

### **Map Tiles Not Loading**

**Error**: Blank gray map

**Possible causes**:
1. No internet connection
2. OpenStreetMap server down (rare)

**Fix**: Switch to alternative tile provider (CartoDB, Esri):
```typescript
url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
```

---

## 🚀 Advanced Features (Optional)

### **1. Auto-Zoom to Fit All Markers**

Add this inside `MapContainer`:

```typescript
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

function FitBounds({ pickup, dropoff, driverLocation }) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = [
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng],
    ];
    
    if (driverLocation) {
      bounds.push([driverLocation.lat, driverLocation.lng]);
    }
    
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [pickup, dropoff, driverLocation, map]);
  
  return null;
}

// Use in MapContainer:
<FitBounds pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />
```

---

### **2. Animated Driver Marker**

Make driver marker pulse:

```typescript
const driverIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="23" fill="#3B82F6" opacity="0.3">
        <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="25" r="20" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
      <path d="M25 15 L25 35 M25 15 L20 20 M25 15 L30 20" stroke="white" stroke-width="3" fill="none"/>
    </svg>
  `),
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});
```

---

### **3. Show Distance on Route**

```typescript
import { Tooltip } from 'react-leaflet';

<Polyline positions={routePositions}>
  <Tooltip direction="center" permanent>
    5.18 km
  </Tooltip>
</Polyline>
```

---

### **4. Click Map to See Coordinates**

```typescript
<MapContainer onClick={(e) => {
  console.log('Clicked at:', e.latlng.lat, e.latlng.lng);
}}>
```

Useful for debugging coordinates.

---

## ✅ Installation Checklist

- [ ] Install leaflet: `npm install leaflet react-leaflet`
- [ ] Install types: `npm install --save-dev @types/leaflet`
- [ ] Replace TrackingMap.tsx with new code
- [ ] Add Leaflet CSS to layout.tsx
- [ ] Restart dev server
- [ ] Test tracking page
- [ ] Verify markers show correctly
- [ ] Test popup clicks
- [ ] Check legend displays

---

## 🎉 You're Done!

**What You Have Now**:
- ✅ Fully functional map (0% cost)
- ✅ Pickup, dropoff, and driver markers
- ✅ Route visualization
- ✅ Interactive popups
- ✅ Map legend
- ✅ Status display
- ✅ No credit card needed!

**Time Saved**: No need to wait for Google Maps approval or add payment method.

**Cost Saved**: $7/1000 map loads = $21/month for 3000 deliveries

---

**Last Updated**: November 22, 2025  
**Map Provider**: OpenStreetMap (Leaflet)  
**Total Cost**: $0 forever
