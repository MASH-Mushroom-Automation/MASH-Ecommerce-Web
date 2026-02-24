/**
 * Tests for src/lib/grower-utils.ts
 * Grower name to ID mapping and URL generation - pure logic
 */
import { getGrowerIdFromName, getGrowerUrl } from "../grower-utils";

describe("getGrowerIdFromName", () => {
  it("maps FungiFreshFarms to 1", () => {
    expect(getGrowerIdFromName("FungiFreshFarms")).toBe(1);
  });

  it("maps TheMushroomatchBukidnon to 2", () => {
    expect(getGrowerIdFromName("TheMushroomatchBukidnon")).toBe(2);
  });

  it("maps KabutehanNiAlingNena to 3", () => {
    expect(getGrowerIdFromName("KabutehanNiAlingNena")).toBe(3);
  });

  it("maps Shroomarket to 4", () => {
    expect(getGrowerIdFromName("Shroomarket")).toBe(4);
  });

  it("maps KingFarms to 1 (alias for Fungi Fresh Farms)", () => {
    expect(getGrowerIdFromName("KingFarms")).toBe(1);
  });

  it("is case-insensitive", () => {
    expect(getGrowerIdFromName("fungifreshfarms")).toBe(1);
    expect(getGrowerIdFromName("FUNGIFRESHFARMS")).toBe(1);
    expect(getGrowerIdFromName("FunGiFreshFarms")).toBe(1);
  });

  it("strips non-alpha characters", () => {
    expect(getGrowerIdFromName("Fungi Fresh Farms")).toBe(1);
    expect(getGrowerIdFromName("The Mushroomatch Bukidnon")).toBe(2);
    expect(getGrowerIdFromName("King-Farms")).toBe(1);
    expect(getGrowerIdFromName("Shroo_market")).toBe(4);
  });

  it("returns null for unknown grower", () => {
    expect(getGrowerIdFromName("UnknownGrower")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getGrowerIdFromName("")).toBeNull();
  });

  it("strips numbers from name before matching", () => {
    // Source regex /[^a-z]/g strips digits too, so "Shroomarket123" normalizes to "shroomarket" which matches
    expect(getGrowerIdFromName("Shroomarket123")).toBe(4);
  });
});

describe("getGrowerUrl", () => {
  it("returns /grower/1 for FungiFreshFarms", () => {
    expect(getGrowerUrl("FungiFreshFarms")).toBe("/grower/1");
  });

  it("returns /grower/2 for TheMushroomatchBukidnon", () => {
    expect(getGrowerUrl("TheMushroomatchBukidnon")).toBe("/grower/2");
  });

  it("returns /grower/3 for KabutehanNiAlingNena", () => {
    expect(getGrowerUrl("KabutehanNiAlingNena")).toBe("/grower/3");
  });

  it("returns /grower/4 for Shroomarket", () => {
    expect(getGrowerUrl("Shroomarket")).toBe("/grower/4");
  });

  it("returns /grower fallback for unknown grower", () => {
    expect(getGrowerUrl("SomeUnknownFarm")).toBe("/grower");
  });

  it("returns /grower fallback for empty string", () => {
    expect(getGrowerUrl("")).toBe("/grower");
  });
});
