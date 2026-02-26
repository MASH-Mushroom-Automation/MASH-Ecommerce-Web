/**
 * Tests for src/lib/api/main.ts
 * Main API service - home page, growers, about, FAQ
 */
import { MainApi } from "../main";

describe("MainApi", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function resolveAsync<T>(promise: Promise<T>): Promise<T> {
    jest.advanceTimersByTime(500);
    return promise;
  }

  describe("getHomePageData", () => {
    it("returns home page data with success", async () => {
      const result = await resolveAsync(MainApi.getHomePageData());
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("returns topGrowers array", async () => {
      const result = await resolveAsync(MainApi.getHomePageData());
      expect(Array.isArray(result.data.topGrowers)).toBe(true);
      expect(result.data.topGrowers.length).toBeGreaterThan(0);
    });

    it("returns heroSlides array", async () => {
      const result = await resolveAsync(MainApi.getHomePageData());
      expect(Array.isArray(result.data.heroSlides)).toBe(true);
      expect(result.data.heroSlides.length).toBeGreaterThan(0);
    });

    it("returns empty featuredProducts (Sanity CMS handles products)", async () => {
      const result = await resolveAsync(MainApi.getHomePageData());
      expect(result.data.featuredProducts).toEqual([]);
    });

    it("growers have required fields", async () => {
      const result = await resolveAsync(MainApi.getHomePageData());
      result.data.topGrowers.forEach((grower) => {
        expect(grower.id).toBeDefined();
        expect(grower.name).toBeDefined();
        expect(grower.address).toBeDefined();
      });
    });
  });

  describe("getGrowers", () => {
    it("returns all growers with success", async () => {
      const result = await resolveAsync(MainApi.getGrowers());
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(4);
    });

    it("each grower has id, name, location, coords", async () => {
      const result = await resolveAsync(MainApi.getGrowers());
      result.data.forEach((grower) => {
        expect(grower.id).toBeDefined();
        expect(grower.name).toBeDefined();
        expect(grower.location).toBeDefined();
        expect(grower.coords).toBeDefined();
        expect(grower.coords.lat).toBeDefined();
        expect(grower.coords.lng).toBeDefined();
      });
    });
  });

  describe("getGrowerById", () => {
    it("returns grower when found", async () => {
      const result = await resolveAsync(MainApi.getGrowerById(1));
      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.data!.id).toBe(1);
    });

    it("returns null when grower not found", async () => {
      const result = await resolveAsync(MainApi.getGrowerById(9999));
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Grower not found");
    });

    it("returns correct grower data for ID 2", async () => {
      const result = await resolveAsync(MainApi.getGrowerById(2));
      expect(result.data!.name).toContain("Mushroom Patch");
    });
  });

  describe("getAboutContent", () => {
    it("returns about page data with success", async () => {
      const result = await resolveAsync(MainApi.getAboutContent());
      expect(result.success).toBe(true);
      expect(result.data.title).toBeDefined();
      expect(result.data.content).toBeDefined();
    });

    it("includes team members array", async () => {
      const result = await resolveAsync(MainApi.getAboutContent());
      expect(Array.isArray(result.data.team)).toBe(true);
      expect(result.data.team.length).toBeGreaterThan(0);
    });

    it("team members have name and role", async () => {
      const result = await resolveAsync(MainApi.getAboutContent());
      result.data.team.forEach((member: any) => {
        expect(member.name).toBeDefined();
        expect(member.role).toBeDefined();
      });
    });
  });

  describe("getFAQContent", () => {
    it("returns FAQ data with success", async () => {
      const result = await resolveAsync(MainApi.getFAQContent());
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("each FAQ has question and answer", async () => {
      const result = await resolveAsync(MainApi.getFAQContent());
      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach((faq) => {
        expect(faq.question).toBeDefined();
        expect(faq.answer).toBeDefined();
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });
});
