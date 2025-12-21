/**
 * Lalamove Vehicle Types and Pricing
 * Source: https://www.lalamove.com/en-ph/all-delivery-pricing-detail?&city=manila-ncr-and-south-luzon
 * Last Updated: December 21, 2025
 */

export interface VehicleType {
  id: string;
  name: string;
  baseFare: number;
  pricePerKm: string;
  addStopFee: number;
  weightLimit: number;
  sizeLimit: string;
  longDistanceFare?: string;
  surcharge: string;
  image: string; // Icon or image for the vehicle
  description?: string;
}

export const LALAMOVE_VEHICLES: VehicleType[] = [
  {
    id: "motorcycle",
    name: "Motorcycle",
    baseFare: 49,
    pricePerKm: "+₱6/km (0-5km), +₱5/km (above 5km)",
    addStopFee: 40,
    weightLimit: 20,
    sizeLimit: "0.5 x 0.4 x 0.5 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🏍️",
    description: "Best for small, lightweight items and documents",
  },
  {
    id: "sedan",
    name: "200kg Sedan (Hatchback/Sedan)",
    baseFare: 100,
    pricePerKm: "+₱18/km (1-5km), +₱15/km (above 5km)",
    addStopFee: 45,
    weightLimit: 200,
    sizeLimit: "1 x 0.6 x 0.7 meters",
    longDistanceFare: "Base Fare ₱715 (first 40km), +₱2/km (41-60km), +₱15/km (above 61km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🚗",
    description: "Ideal for medium-sized packages and multiple deliveries",
  },
  {
    id: "suv-subcompact",
    name: "300kg Subcompact SUV / Crossover",
    baseFare: 115,
    pricePerKm: "+₱20/km (1-30km), +₱17/km (31-40km)",
    addStopFee: 45,
    weightLimit: 300,
    sizeLimit: "1.2 x 1 x 0.9 meters",
    longDistanceFare: "Base Fare ₱885 (first 40km), +₱2/km (41-60km), +₱17/km (above 60km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🚙",
    description: "Perfect for larger items and furniture",
  },
  {
    id: "suv-7seater",
    name: "600kg 7-seater SUV / Small Van",
    baseFare: 200,
    pricePerKm: "+₱20/km (1-30km), +₱17/km (31-40km)",
    addStopFee: 50,
    weightLimit: 600,
    sizeLimit: "2.1 x 1.2 x 1.1 meters",
    longDistanceFare: "Base Fare ₱970 (first 40km), +₱2/km (41-60km), +₱17/km (above 60km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🚐",
    description: "Great for bulky items and moving needs",
  },
  {
    id: "pickup",
    name: "800kg Pickup",
    baseFare: 240,
    pricePerKm: "+₱20/km",
    addStopFee: 50,
    weightLimit: 800,
    sizeLimit: "2.7 x 1.5 x 0.5 meters",
    longDistanceFare: "Base Fare ₱1,040 (first 40km), +₱2/km (40-60km), +₱17/km (above 60km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🛻",
    description: "Heavy-duty for construction materials and large cargo",
  },
  {
    id: "l300",
    name: "1,000kg L300 / Cargo Van",
    baseFare: 280,
    pricePerKm: "+₱20/km",
    addStopFee: 100,
    weightLimit: 1000,
    sizeLimit: "2.1 × 1.2 × 1.2 meters",
    longDistanceFare: "Base Fare ₱1,080 (first 40km), +₱2/km (41-60km), +₱18/km (above 60km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🚚",
    description: "Commercial deliveries and business logistics",
  },
  {
    id: "fb",
    name: "2,000kg FB",
    baseFare: 900,
    pricePerKm: "+₱26/km",
    addStopFee: 255,
    weightLimit: 2000,
    sizeLimit: "3 × 1.7 × 1.7 meters",
    longDistanceFare: "Base Fare ₱1,780 (first 40km), +₱5/km (40-60km), +₱26/km (above 60km)",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    image: "🚛",
    description: "Large-scale commercial and industrial deliveries",
  },
];

/**
 * Calculate estimated delivery cost based on distance
 */
export function calculateEstimate(vehicleId: string, distanceKm: number, addStops: number = 0): number {
  const vehicle = LALAMOVE_VEHICLES.find((v) => v.id === vehicleId);
  if (!vehicle) return 0;

  let total = vehicle.baseFare;
  
  // Simple calculation (actual pricing may vary)
  // This is a rough estimate, actual price comes from Lalamove API
  if (distanceKm <= 5) {
    total += distanceKm * 18; // Average
  } else {
    total += 5 * 18 + (distanceKm - 5) * 15;
  }

  total += addStops * vehicle.addStopFee;

  return Math.round(total);
}
