/**
 * Tests for src/lib/lalamove.ts
 * Lalamove vehicle types, delivery pricing engine, fare calculations
 */

import {
  LALAMOVE_VEHICLES,
  calculateLalamoveFee,
  getLalamoveVehicle,
  getVehiclesForWeight,
} from "../lalamove";
import type { LalamoveVehicle } from "../lalamove";

// ---- LALAMOVE_VEHICLES constant ----
describe("LALAMOVE_VEHICLES", () => {
  it("should have 11 vehicle types", () => {
    expect(LALAMOVE_VEHICLES).toHaveLength(11);
  });

  it("should have unique IDs", () => {
    const ids = LALAMOVE_VEHICLES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should include all expected vehicle types", () => {
    const ids = LALAMOVE_VEHICLES.map((v) => v.id);
    expect(ids).toContain("motorcycle");
    expect(ids).toContain("sedan");
    expect(ids).toContain("suv");
    expect(ids).toContain("suv_7seater");
    expect(ids).toContain("pickup");
    expect(ids).toContain("l300");
    expect(ids).toContain("fb");
    expect(ids).toContain("aluminum");
    expect(ids).toContain("truck_3000");
    expect(ids).toContain("truck_7000");
    expect(ids).toContain("truck_12000");
  });

  it("should have positive base fares for all vehicles", () => {
    LALAMOVE_VEHICLES.forEach((v) => {
      expect(v.baseFare).toBeGreaterThan(0);
    });
  });

  it("should have positive weight limits", () => {
    LALAMOVE_VEHICLES.forEach((v) => {
      expect(v.weightLimit).toBeGreaterThan(0);
    });
  });

  it("should have non-empty size limits", () => {
    LALAMOVE_VEHICLES.forEach((v) => {
      expect(v.sizeLimit.length).toBeGreaterThan(0);
    });
  });

  it("should have positive add stop fees", () => {
    LALAMOVE_VEHICLES.forEach((v) => {
      expect(v.addStopFee).toBeGreaterThan(0);
    });
  });

  it("should have surcharge info for all vehicles", () => {
    LALAMOVE_VEHICLES.forEach((v) => {
      expect(v.surcharge).toBeTruthy();
    });
  });

  it("should have rental info for some vehicles", () => {
    const vehiclesWithRental = LALAMOVE_VEHICLES.filter((v) => v.rental);
    expect(vehiclesWithRental.length).toBeGreaterThan(0);

    vehiclesWithRental.forEach((v) => {
      expect(v.rental!.fullDay).toBeGreaterThan(0);
      expect(v.rental!.extraHour).toBeGreaterThan(0);
    });
  });

  it("motorcycle should have correct base fare", () => {
    const motorcycle = LALAMOVE_VEHICLES.find((v) => v.id === "motorcycle")!;
    expect(motorcycle.baseFare).toBe(49);
    expect(motorcycle.weightLimit).toBe(20);
    expect(motorcycle.perKm_0_5).toBe(6);
    expect(motorcycle.perKm_above_5).toBe(5);
  });

  it("truck_12000 should be the largest vehicle", () => {
    const truck = LALAMOVE_VEHICLES.find((v) => v.id === "truck_12000")!;
    expect(truck.weightLimit).toBe(12000);
    expect(truck.baseFare).toBe(7200);
  });
});

// ---- getLalamoveVehicle ----
describe("getLalamoveVehicle", () => {
  it("should return vehicle by ID", () => {
    const vehicle = getLalamoveVehicle("motorcycle");
    expect(vehicle).toBeDefined();
    expect(vehicle!.name).toBe("Motorcycle");
  });

  it("should return undefined for unknown ID", () => {
    const vehicle = getLalamoveVehicle("helicopter");
    expect(vehicle).toBeUndefined();
  });

  it("should return correct vehicle for each type", () => {
    const sedan = getLalamoveVehicle("sedan");
    expect(sedan!.weightLimit).toBe(200);

    const suv = getLalamoveVehicle("suv");
    expect(suv!.weightLimit).toBe(300);
  });
});

// ---- getVehiclesForWeight ----
describe("getVehiclesForWeight", () => {
  it("should return all vehicles for very light items (1kg)", () => {
    const vehicles = getVehiclesForWeight(1);
    expect(vehicles).toHaveLength(11);
  });

  it("should exclude motorcycle for items over 20kg", () => {
    const vehicles = getVehiclesForWeight(25);
    const ids = vehicles.map((v) => v.id);
    expect(ids).not.toContain("motorcycle");
    expect(ids).toContain("sedan");
  });

  it("should exclude motorcycle and sedan for items over 200kg", () => {
    const vehicles = getVehiclesForWeight(250);
    const ids = vehicles.map((v) => v.id);
    expect(ids).not.toContain("motorcycle");
    expect(ids).not.toContain("sedan");
    expect(ids).toContain("suv");
  });

  it("should only return large trucks for very heavy items", () => {
    const vehicles = getVehiclesForWeight(8000);
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].id).toBe("truck_12000");
  });

  it("should return empty array for impossibly heavy items", () => {
    const vehicles = getVehiclesForWeight(50000);
    expect(vehicles).toHaveLength(0);
  });

  it("should include vehicle at exact weight limit", () => {
    const vehicles = getVehiclesForWeight(20);
    const ids = vehicles.map((v) => v.id);
    expect(ids).toContain("motorcycle");
  });
});

// ---- calculateLalamoveFee ----
describe("calculateLalamoveFee", () => {
  describe("unknown vehicle", () => {
    it("should return 0 for unknown vehicle ID", () => {
      const fee = calculateLalamoveFee("helicopter", 10);
      expect(fee).toBe(0);
    });
  });

  describe("motorcycle (tiered: 0-5km + above 5km)", () => {
    it("should calculate fee for short distance (3km)", () => {
      // baseFare(49) + 3km * 6 = 49 + 18 = 67
      const fee = calculateLalamoveFee("motorcycle", 3);
      expect(fee).toBe(67);
    });

    it("should calculate fee for exactly 5km", () => {
      // baseFare(49) + 5km * 6 = 49 + 30 = 79
      const fee = calculateLalamoveFee("motorcycle", 5);
      expect(fee).toBe(79);
    });

    it("should calculate fee for distance above 5km", () => {
      // baseFare(49) + 5km * 6 + 5km * 5 = 49 + 30 + 25 = 104
      const fee = calculateLalamoveFee("motorcycle", 10);
      expect(fee).toBe(104);
    });

    it("should calculate fee for zero distance", () => {
      // baseFare(49) + 0 = 49
      const fee = calculateLalamoveFee("motorcycle", 0);
      expect(fee).toBe(49);
    });
  });

  describe("SUV (tiered: 1-30km + 31-40km)", () => {
    it("should calculate fee for 15km", () => {
      // baseFare(115) + 15km * 20 = 115 + 300 = 415
      const fee = calculateLalamoveFee("suv", 15);
      expect(fee).toBe(415);
    });

    it("should calculate fee for exactly 30km", () => {
      // baseFare(115) + 30km * 20 = 115 + 600 = 715
      const fee = calculateLalamoveFee("suv", 30);
      expect(fee).toBe(715);
    });

    it("should calculate fee for 35km (in 31-40 tier)", () => {
      // baseFare(115) + 30km * 20 + 5km * 17 = 115 + 600 + 85 = 800
      const fee = calculateLalamoveFee("suv", 35);
      expect(fee).toBe(800);
    });
  });

  describe("pickup (flat rate per km)", () => {
    it("should calculate fee with flat rate", () => {
      // baseFare(240) + 15km * 20 = 240 + 300 = 540
      const fee = calculateLalamoveFee("pickup", 15);
      expect(fee).toBe(540);
    });

    it("should calculate fee for 30km", () => {
      // baseFare(240) + 30km * 20 = 240 + 600 = 840
      const fee = calculateLalamoveFee("pickup", 30);
      expect(fee).toBe(840);
    });
  });

  describe("long distance calculations", () => {
    it("should use long distance base fare for >40km", () => {
      // sedan ldBaseFare = 715
      // 50km: ldBaseFare(715) + 10km * ldPerKm_41_60(2) = 715 + 20 = 735
      const fee = calculateLalamoveFee("sedan", 50);
      expect(fee).toBe(735);
    });

    it("should handle long distance above 60km for SUV", () => {
      // suv ldBaseFare = 885
      // 70km: ldBaseFare(885) + 20km * ldPerKm_41_60(2) + 10km * ldPerKm_above_60(17)
      // = 885 + 40 + 170 = 1095
      const fee = calculateLalamoveFee("suv", 70);
      expect(fee).toBe(1095);
    });

    it("should handle explicit isLongDistance flag", () => {
      // Force long distance even for short distance
      const fee = calculateLalamoveFee("sedan", 50, true);
      expect(fee).toBeGreaterThan(0);
    });

    it("should handle pickup long distance", () => {
      // pickup ldBaseFare = 1040
      // 50km: ldBaseFare(1040) + 10km * ldPerKm_40_60(2) = 1040 + 20 = 1060
      const fee = calculateLalamoveFee("pickup", 50);
      expect(fee).toBe(1060);
    });
  });

  describe("truck_12000 special pricing", () => {
    it("should calculate for distance under 200km", () => {
      // ldBaseFare(10600) + (100-40=60) * ldPerKm_40_60(65) = 10600 + 3900 = 14500
      const fee = calculateLalamoveFee("truck_12000", 100);
      expect(fee).toBe(14500);
    });

    it("should calculate for distance 200-299km", () => {
      // ldBaseFare(10600)
      // + 159km * ldPerKm_40_60(65) = 10335
      // + (250-199=51) * ldPerKm_above_60(60) = 3060
      // total = 10600 + 10335 + 3060 = 23995
      const fee = calculateLalamoveFee("truck_12000", 250);
      expect(fee).toBe(23995);
    });

    it("should calculate for distance above 300km", () => {
      // ldBaseFare(10600)
      // + 159 * 65 = 10335
      // + 100 * 60 = 6000
      // + (350-299=51) * 50 = 2550
      // total = 10600 + 10335 + 6000 + 2550 = 29485
      const fee = calculateLalamoveFee("truck_12000", 350);
      expect(fee).toBe(29485);
    });
  });

  describe("edge cases", () => {
    it("should return rounded integer fees", () => {
      const fee = calculateLalamoveFee("motorcycle", 7);
      expect(Number.isInteger(fee)).toBe(true);
    });

    it("should handle very large distances", () => {
      const fee = calculateLalamoveFee("truck_7000", 500);
      expect(fee).toBeGreaterThan(0);
    });

    it("should handle non-long-distance flag override", () => {
      // Force standard calc even though >40km
      const fee = calculateLalamoveFee("pickup", 50, false);
      // baseFare(240) + 50 * 20 = 240 + 1000 = 1240
      expect(fee).toBe(1240);
    });
  });
});
