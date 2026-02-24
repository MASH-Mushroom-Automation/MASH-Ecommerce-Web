/**
 * Tests for src/lib/locations.ts
 * Philippine location data lookups - pure data + filter/find functions
 */
import {
  REGIONS,
  CITIES,
  BARANGAYS,
  getRegions,
  getCitiesByRegion,
  getBarangaysByCity,
  getRegionByCode,
  getCityByCode,
  getBarangayByCode,
} from "../locations";

describe("location data integrity", () => {
  it("REGIONS has at least 5 entries", () => {
    expect(REGIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("each region has code and name", () => {
    for (const region of REGIONS) {
      expect(region.code).toBeTruthy();
      expect(region.name).toBeTruthy();
    }
  });

  it("CITIES has at least 10 entries", () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(10);
  });

  it("each city has code, name, regionCode, and provinceName", () => {
    for (const city of CITIES) {
      expect(city.code).toBeTruthy();
      expect(city.name).toBeTruthy();
      expect(city.regionCode).toBeTruthy();
      expect(city.provinceName).toBeTruthy();
    }
  });

  it("every city references a valid region code", () => {
    const regionCodes = new Set(REGIONS.map((r) => r.code));
    for (const city of CITIES) {
      expect(regionCodes.has(city.regionCode)).toBe(true);
    }
  });

  it("BARANGAYS has at least 15 entries", () => {
    expect(BARANGAYS.length).toBeGreaterThanOrEqual(15);
  });

  it("each barangay has code, name, and cityCode", () => {
    for (const brgy of BARANGAYS) {
      expect(brgy.code).toBeTruthy();
      expect(brgy.name).toBeTruthy();
      expect(brgy.cityCode).toBeTruthy();
    }
  });

  it("every barangay references a valid city code", () => {
    const cityCodes = new Set(CITIES.map((c) => c.code));
    for (const brgy of BARANGAYS) {
      expect(cityCodes.has(brgy.cityCode)).toBe(true);
    }
  });

  it("no duplicate region codes", () => {
    const codes = REGIONS.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("no duplicate city codes", () => {
    const codes = CITIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("no duplicate barangay codes", () => {
    const codes = BARANGAYS.map((b) => b.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("getRegions", () => {
  it("returns all regions", () => {
    const regions = getRegions();
    expect(regions).toEqual(REGIONS);
    expect(regions.length).toBe(REGIONS.length);
  });

  it("includes NCR", () => {
    const regions = getRegions();
    expect(regions.some((r) => r.code === "NCR")).toBe(true);
  });
});

describe("getCitiesByRegion", () => {
  it("returns NCR cities", () => {
    const cities = getCitiesByRegion("NCR");
    expect(cities.length).toBeGreaterThanOrEqual(3);
    expect(cities.every((c) => c.regionCode === "NCR")).toBe(true);
  });

  it("returns Region III cities", () => {
    const cities = getCitiesByRegion("REGION_III");
    expect(cities.length).toBeGreaterThanOrEqual(2);
    expect(cities.every((c) => c.regionCode === "REGION_III")).toBe(true);
  });

  it("returns empty array for non-existent region", () => {
    const cities = getCitiesByRegion("NONEXISTENT");
    expect(cities).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(getCitiesByRegion("")).toEqual([]);
  });
});

describe("getBarangaysByCity", () => {
  it("returns barangays for Quezon City", () => {
    const brgys = getBarangaysByCity("NCR", "QUEZON_CITY");
    expect(brgys.length).toBeGreaterThanOrEqual(3);
    expect(brgys.every((b) => b.cityCode === "QUEZON_CITY")).toBe(true);
  });

  it("returns barangays for Manila", () => {
    const brgys = getBarangaysByCity("NCR", "MANILA");
    expect(brgys.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty array for non-existent city", () => {
    expect(getBarangaysByCity("NCR", "FAKE_CITY")).toEqual([]);
  });

  it("filters by cityCode regardless of regionCode parameter", () => {
    // The function actually ignores regionCode and filters only by cityCode
    const brgys = getBarangaysByCity("WRONG_REGION", "QUEZON_CITY");
    expect(brgys.length).toBeGreaterThanOrEqual(3);
  });
});

describe("getRegionByCode", () => {
  it("finds NCR region", () => {
    const region = getRegionByCode("NCR");
    expect(region).toBeDefined();
    expect(region?.name).toBe("National Capital Region");
  });

  it("finds CALABARZON region", () => {
    const region = getRegionByCode("REGION_IV_A");
    expect(region).toBeDefined();
    expect(region?.name).toBe("CALABARZON");
  });

  it("returns undefined for non-existent code", () => {
    expect(getRegionByCode("FAKE")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getRegionByCode("")).toBeUndefined();
  });
});

describe("getCityByCode", () => {
  it("finds Quezon City", () => {
    const city = getCityByCode("QUEZON_CITY");
    expect(city).toBeDefined();
    expect(city?.name).toBe("Quezon City");
    expect(city?.regionCode).toBe("NCR");
    expect(city?.postalCode).toBe("1100");
  });

  it("finds Makati", () => {
    const city = getCityByCode("MAKATI");
    expect(city).toBeDefined();
    expect(city?.name).toBe("Makati");
  });

  it("returns undefined for non-existent code", () => {
    expect(getCityByCode("FAKE_CITY")).toBeUndefined();
  });
});

describe("getBarangayByCode", () => {
  it("finds Diliman barangay", () => {
    const brgy = getBarangayByCode("QC_DILIMAN");
    expect(brgy).toBeDefined();
    expect(brgy?.name).toBe("Diliman");
    expect(brgy?.cityCode).toBe("QUEZON_CITY");
  });

  it("finds BGC barangay", () => {
    const brgy = getBarangayByCode("TAG_BGC");
    expect(brgy).toBeDefined();
    expect(brgy?.name).toBe("Bonifacio Global City");
    expect(brgy?.cityCode).toBe("TAGUIG");
  });

  it("returns undefined for non-existent code", () => {
    expect(getBarangayByCode("FAKE")).toBeUndefined();
  });
});
