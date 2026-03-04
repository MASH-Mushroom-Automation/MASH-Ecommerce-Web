/**
 * Tests for src/lib/maps-config.ts
 * Covers: MAPS_CONFIG structure, default center coordinates, map options, libraries
 */

import { MAPS_CONFIG, isMapsConfigured } from "../maps-config";

describe("MAPS_CONFIG", () => {
  it("exports a config object", () => {
    expect(MAPS_CONFIG).toBeDefined();
    expect(typeof MAPS_CONFIG).toBe("object");
  });

  describe("apiKey", () => {
    it("is a string", () => {
      expect(typeof MAPS_CONFIG.apiKey).toBe("string");
    });
  });

  describe("defaultCenter", () => {
    it("has lat and lng", () => {
      expect(MAPS_CONFIG.defaultCenter).toBeDefined();
      expect(typeof MAPS_CONFIG.defaultCenter.lat).toBe("number");
      expect(typeof MAPS_CONFIG.defaultCenter.lng).toBe("number");
    });

    it("is centered on Manila, Philippines", () => {
      // Manila approximate coords: lat ~14.5, lng ~120.9
      expect(MAPS_CONFIG.defaultCenter.lat).toBeCloseTo(14.5995, 2);
      expect(MAPS_CONFIG.defaultCenter.lng).toBeCloseTo(120.9842, 2);
    });

    it("has valid coordinate ranges", () => {
      expect(MAPS_CONFIG.defaultCenter.lat).toBeGreaterThanOrEqual(-90);
      expect(MAPS_CONFIG.defaultCenter.lat).toBeLessThanOrEqual(90);
      expect(MAPS_CONFIG.defaultCenter.lng).toBeGreaterThanOrEqual(-180);
      expect(MAPS_CONFIG.defaultCenter.lng).toBeLessThanOrEqual(180);
    });
  });

  describe("defaultZoom", () => {
    it("is a positive number", () => {
      expect(typeof MAPS_CONFIG.defaultZoom).toBe("number");
      expect(MAPS_CONFIG.defaultZoom).toBeGreaterThan(0);
    });

    it("is within valid Google Maps zoom range (0-21)", () => {
      expect(MAPS_CONFIG.defaultZoom).toBeGreaterThanOrEqual(0);
      expect(MAPS_CONFIG.defaultZoom).toBeLessThanOrEqual(21);
    });

    it("default zoom is city-level (10-15)", () => {
      expect(MAPS_CONFIG.defaultZoom).toBeGreaterThanOrEqual(10);
      expect(MAPS_CONFIG.defaultZoom).toBeLessThanOrEqual(15);
    });
  });

  describe("mapOptions", () => {
    it("enables zoom control", () => {
      expect(MAPS_CONFIG.mapOptions.zoomControl).toBe(true);
    });

    it("disables street view control", () => {
      expect(MAPS_CONFIG.mapOptions.streetViewControl).toBe(false);
    });

    it("enables fullscreen control", () => {
      expect(MAPS_CONFIG.mapOptions.fullscreenControl).toBe(true);
    });

    it("disables map type control", () => {
      expect(MAPS_CONFIG.mapOptions.mapTypeControl).toBe(false);
    });
  });

  describe("libraries", () => {
    it("includes places library", () => {
      expect(MAPS_CONFIG.libraries).toContain("places");
    });

    it("includes geometry library", () => {
      expect(MAPS_CONFIG.libraries).toContain("geometry");
    });

    it("has exactly 2 libraries", () => {
      expect(MAPS_CONFIG.libraries).toHaveLength(2);
    });
  });
});

describe("isMapsConfigured", () => {
  it("returns a boolean", () => {
    expect(typeof isMapsConfigured()).toBe("boolean");
  });

  it("returns false when apiKey is empty", () => {
    const original = MAPS_CONFIG.apiKey;
    (MAPS_CONFIG as any).apiKey = "";
    expect(isMapsConfigured()).toBe(false);
    (MAPS_CONFIG as any).apiKey = original;
  });

  it("returns true when apiKey is set", () => {
    const original = MAPS_CONFIG.apiKey;
    (MAPS_CONFIG as any).apiKey = "test-key-123";
    expect(isMapsConfigured()).toBe(true);
    (MAPS_CONFIG as any).apiKey = original;
  });
});
