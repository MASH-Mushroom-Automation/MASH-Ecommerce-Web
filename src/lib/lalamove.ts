/**
 * Lalamove Vehicle Types and Pricing
 * 
 * Source: https://www.lalamove.com/en-ph/all-delivery-pricing-detail?&city=manila-ncr-and-south-luzon
 * Last Updated: December 21, 2025
 * 
 * All prices in Philippine Pesos (₱)
 */

export interface LalamoveVehicle {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  
  // Base pricing
  baseFare: number;
  
  // Per kilometer rates
  perKm_0_5?: number;  // First 5km
  perKm_1_30?: number; // 1-30km
  perKm_31_40?: number; // 31-40km
  perKm_above_5?: number; // Above 5km
  perKm_above_30?: number; // Above 30km
  
  // Flat rate per km (for some vehicles)
  perKm?: number;
  
  // Long distance rates
  ldBaseFare?: number; // Long distance base fare (first 40km)
  ldPerKm_40_60?: number; // 40-60km
  ldPerKm_41_60?: number; // 41-60km
  ldPerKm_above_60?: number; // Above 60km
  ldPerKm_above_61?: number; // Above 61km
  ldPerKm_40_53?: number; // 40-53km
  ldPerKm_above_53?: number; // Above 53km
  
  // Additional costs
  addStopFee: number; // Fee per additional stop
  
  // Specifications
  weightLimit: number; // in kg
  sizeLimit: string; // Dimensions in meters (L x W x H)
  
  // Surcharges
  surcharge: string;
  
  // Rental rates (optional)
  rental?: {
    fullDay: number; // 10 hours
    extraHour: number;
    documentHandling: number;
    doorToDoor: number;
  };
}

/**
 * All 10 Lalamove Vehicle Types for Philippines
 */
export const LALAMOVE_VEHICLES: LalamoveVehicle[] = [
  {
    id: "motorcycle",
    name: "Motorcycle",
    displayName: "Motorcycle",
    icon: "🏍️",
    baseFare: 49,
    perKm_0_5: 6,
    perKm_above_5: 5,
    addStopFee: 40,
    weightLimit: 20,
    sizeLimit: "0.5 x 0.4 x 0.5 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "sedan",
    name: "200kg Sedan",
    displayName: "200kg Sedan (Hatchback/Sedan)",
    icon: "🚗",
    baseFare: 100,
    perKm_0_5: 18,
    perKm_above_5: 15,
    ldBaseFare: 715,
    ldPerKm_41_60: 2,
    ldPerKm_above_61: 15,
    addStopFee: 45,
    weightLimit: 200,
    sizeLimit: "1 x 0.6 x 0.7 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "suv",
    name: "300kg SUV",
    displayName: "300kg Subcompact SUV / Crossover",
    icon: "🚙",
    baseFare: 115,
    perKm_1_30: 20,
    perKm_31_40: 17,
    ldBaseFare: 885,
    ldPerKm_41_60: 2,
    ldPerKm_above_60: 17,
    addStopFee: 45,
    weightLimit: 300,
    sizeLimit: "1.2 x 1 x 0.9 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "suv_7seater",
    name: "600kg 7-seater SUV",
    displayName: "600kg 7-seater SUV / Small Van",
    icon: "🚐",
    baseFare: 200,
    perKm_1_30: 20,
    perKm_31_40: 17,
    ldBaseFare: 970,
    ldPerKm_41_60: 2,
    ldPerKm_above_60: 17,
    addStopFee: 50,
    weightLimit: 600,
    sizeLimit: "2.1 x 1.2 x 1.1 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "pickup",
    name: "800kg Pickup",
    displayName: "800kg Pickup",
    icon: "🛻",
    baseFare: 240,
    perKm: 20,
    ldBaseFare: 1040,
    ldPerKm_40_60: 2,
    ldPerKm_above_60: 17,
    addStopFee: 50,
    weightLimit: 800,
    sizeLimit: "2.7 x 1.5 x 0.5 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "l300",
    name: "1,000kg L300",
    displayName: "1,000kg L300 / Cargo Van",
    icon: "🚚",
    baseFare: 280,
    perKm: 20,
    ldBaseFare: 1080,
    ldPerKm_41_60: 2,
    ldPerKm_above_60: 18,
    addStopFee: 100,
    weightLimit: 1000,
    sizeLimit: "2.1 x 1.2 x 1.2 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    rental: {
      fullDay: 3500,
      extraHour: 200,
      documentHandling: 80,
      doorToDoor: 450
    }
  },
  {
    id: "fb",
    name: "2,000kg FB",
    displayName: "2,000kg FB",
    icon: "🚛",
    baseFare: 900,
    perKm: 26,
    ldBaseFare: 1780,
    ldPerKm_40_60: 5,
    ldPerKm_above_60: 26,
    addStopFee: 255,
    weightLimit: 2000,
    sizeLimit: "3 x 1.7 x 1.7 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "aluminum",
    name: "2,000kg Aluminum",
    displayName: "2,000kg Aluminum",
    icon: "🚚",
    baseFare: 1040,
    perKm: 29,
    ldBaseFare: 2200,
    ldPerKm_40_53: 5,
    ldPerKm_above_53: 26,
    addStopFee: 255,
    weightLimit: 2000,
    sizeLimit: "3 x 1.7 x 1.7 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours"
  },
  {
    id: "truck_3000",
    name: "3,000kg Truck",
    displayName: "3,000kg Truck",
    icon: "🚛",
    baseFare: 1450,
    perKm: 33,
    ldBaseFare: 2770,
    ldPerKm_40_53: 5,
    ldPerKm_above_53: 33,
    addStopFee: 255,
    weightLimit: 3000,
    sizeLimit: "4.3 x 1.8 x 2.1 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    rental: {
      fullDay: 7000,
      extraHour: 500,
      documentHandling: 80,
      doorToDoor: 450
    }
  },
  {
    id: "truck_7000",
    name: "7,000kg Truck",
    displayName: "7,000kg Truck",
    icon: "🚛",
    baseFare: 4420,
    perKm: 50,
    ldBaseFare: 6420,
    ldPerKm_above_60: 50,
    addStopFee: 500,
    weightLimit: 7000,
    sizeLimit: "5.5 x 1.8 x 0.5 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    rental: {
      fullDay: 9000,
      extraHour: 500,
      documentHandling: 80,
      doorToDoor: 450
    }
  },
  {
    id: "truck_12000",
    name: "12,000kg Truck",
    displayName: "12,000kg Truck (Aluminum / Wing Van)",
    icon: "🚚",
    baseFare: 7200,
    perKm: 85,
    ldBaseFare: 10600,
    ldPerKm_40_60: 65, // 40-199km uses different rate
    ldPerKm_above_60: 60, // 200-299km
    ldPerKm_above_61: 50, // above 300km
    addStopFee: 800,
    weightLimit: 12000,
    sizeLimit: "10 x 2.4 x 2.3 meters",
    surcharge: "High Demand Surcharge of up to 300% may apply during peak hours",
    rental: {
      fullDay: 12000,
      extraHour: 500,
      documentHandling: 80,
      doorToDoor: 450
    }
  }
];

/**
 * Calculate delivery fee based on distance and vehicle type
 * 
 * @param vehicleId - Lalamove vehicle ID
 * @param distanceKm - Distance in kilometers
 * @param isLongDistance - Whether this is a long distance delivery (> 40km)
 * @returns Estimated delivery fee in PHP
 */
export function calculateLalamoveFee(
  vehicleId: string,
  distanceKm: number,
  isLongDistance: boolean = distanceKm > 40
): number {
  const vehicle = LALAMOVE_VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return 0;

  let fee = 0;

  // Long distance calculation (> 40km)
  if (isLongDistance && vehicle.ldBaseFare) {
    fee = vehicle.ldBaseFare;
    
    const extraKm = distanceKm - 40;
    
    // Special case for 12,000kg truck with tiered rates
    if (vehicleId === "truck_12000") {
      if (distanceKm <= 199) {
        fee += extraKm * (vehicle.ldPerKm_40_60 || 0);
      } else if (distanceKm <= 299) {
        fee += 159 * (vehicle.ldPerKm_40_60 || 0); // First 159km
        fee += (distanceKm - 199) * (vehicle.ldPerKm_above_60 || 0);
      } else {
        fee += 159 * (vehicle.ldPerKm_40_60 || 0);
        fee += 100 * (vehicle.ldPerKm_above_60 || 0);
        fee += (distanceKm - 299) * (vehicle.ldPerKm_above_61 || 0);
      }
    } else {
      // Standard long distance calculation
      if (distanceKm <= 60) {
        fee += extraKm * (vehicle.ldPerKm_40_60 || vehicle.ldPerKm_41_60 || 0);
      } else if (vehicle.ldPerKm_40_53 && distanceKm <= 53) {
        fee += (53 - 40) * (vehicle.ldPerKm_40_53 || 0);
        fee += (distanceKm - 53) * (vehicle.ldPerKm_above_53 || 0);
      } else {
        const firstTier = Math.min(20, extraKm);
        fee += firstTier * (vehicle.ldPerKm_40_60 || vehicle.ldPerKm_41_60 || 0);
        
        if (extraKm > 20) {
          fee += (extraKm - 20) * (vehicle.ldPerKm_above_60 || vehicle.ldPerKm_above_61 || 0);
        }
      }
    }
  } else {
    // Standard distance calculation
    fee = vehicle.baseFare;
    
    if (vehicle.perKm) {
      // Flat rate per km
      fee += distanceKm * vehicle.perKm;
    } else {
      // Tiered rates
      if (vehicle.perKm_0_5) {
        const first5km = Math.min(5, distanceKm);
        fee += first5km * vehicle.perKm_0_5;
        
        if (distanceKm > 5) {
          fee += (distanceKm - 5) * (vehicle.perKm_above_5 || 0);
        }
      } else if (vehicle.perKm_1_30) {
        const first30km = Math.min(30, distanceKm);
        fee += first30km * vehicle.perKm_1_30;
        
        if (distanceKm > 30 && distanceKm <= 40) {
          fee += (distanceKm - 30) * (vehicle.perKm_31_40 || 0);
        } else if (distanceKm > 40) {
          fee += 10 * (vehicle.perKm_31_40 || 0);
          fee += (distanceKm - 40) * (vehicle.perKm_above_30 || 0);
        }
      }
    }
  }

  return Math.round(fee);
}

/**
 * Get vehicle by ID
 */
export function getLalamoveVehicle(vehicleId: string): LalamoveVehicle | undefined {
  return LALAMOVE_VEHICLES.find(v => v.id === vehicleId);
}

/**
 * Get vehicles suitable for weight
 */
export function getVehiclesForWeight(weightKg: number): LalamoveVehicle[] {
  return LALAMOVE_VEHICLES.filter(v => v.weightLimit >= weightKg);
}
